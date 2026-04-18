import os, uuid, secrets, logging, mimetypes
from datetime import datetime, timedelta
from io import BytesIO
from pathlib import Path

import bleach
from dotenv import load_dotenv
from fastapi import (
    FastAPI, Depends, HTTPException, UploadFile, File,
    Form, Cookie, Request
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from jose import JWTError, jwt
import bcrypt as _bcrypt
from PIL import Image
from pydantic import BaseModel, Field
from sqlalchemy import create_engine, Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import sessionmaker, DeclarativeBase, relationship, Session
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from starlette.middleware.base import BaseHTTPMiddleware

load_dotenv()

# ── Config ────────────────────────────────────────────────────────────
def _load_secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if key:
        return key
    # No .env: generate once and persist to a local file so restarts don't
    # invalidate every session.
    key_file = Path(__file__).parent / ".secret_key"
    if key_file.exists():
        return key_file.read_text().strip()
    key = secrets.token_hex(32)
    key_file.write_text(key)
    key_file.chmod(0o600)
    return key

SECRET_KEY = _load_secret_key()
# Pre-computed once at startup; used as constant-time dummy in login to prevent timing-based
# account enumeration. Must be a valid bcrypt hash so checkpw runs the full cost factor.
_DUMMY_HASH = _bcrypt.hashpw(b"__dummy_placeholder__", _bcrypt.gensalt()).decode()
ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 2
UPLOAD_DIR = Path(__file__).parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
DIST_DIR = Path(__file__).parent.parent / "dist"

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")

# ── Logging ───────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger("security")

SUSPICIOUS_PATTERNS = [
    "../", "..\\", "<script", "select ", "union ", "insert ",
    "drop ", "<?php", "{{", "${", "system(", "exec(", "eval(",
    "__import__", "subprocess", "os.popen",
]

# ── Database ──────────────────────────────────────────────────────────
DB_PATH = Path(__file__).parent / "app.db"
engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    avatar_filename = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="author", cascade="all, delete-orphan")


class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    content = Column(String(1000), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    author = relationship("User", back_populates="messages")


Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Auth ──────────────────────────────────────────────────────────────
def hash_password(p: str) -> str:
    return _bcrypt.hashpw(p.encode(), _bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return _bcrypt.checkpw(plain.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user_id: int) -> str:
    exp = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": str(user_id), "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def get_optional_user(
    session: str = Cookie(None),
    db: Session = Depends(get_db),
):
    if not session:
        return None
    try:
        payload = jwt.decode(session, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None


def get_current_user(
    session: str = Cookie(None),
    db: Session = Depends(get_db),
) -> User:
    if not session:
        raise HTTPException(401, "請先登入")
    try:
        payload = jwt.decode(session, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(401, "無效的登入狀態，請重新登入")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(401, "用戶不存在")
    return user


# ── Schemas ───────────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1, max_length=100)


class MessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)


# ── Image validation ──────────────────────────────────────────────────
def validate_and_save_image(content: bytes, original_filename: str) -> str:
    ext = Path(original_filename).suffix.lower()
    if ext not in (".jpg", ".jpeg", ".png"):
        raise HTTPException(400, "只允許 jpg、png 格式")
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(400, "檔案大小不能超過 5MB")
    try:
        img = Image.open(BytesIO(content))
        if img.format not in ("JPEG", "PNG"):
            raise ValueError(f"格式不支援: {img.format}")
        img.verify()
        img = Image.open(BytesIO(content))
        img = img.convert("RGB")
        img.thumbnail((400, 400))
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(400, "無法處理此圖片，請確認是有效的 jpg 或 png 檔案")

    filename = f"{uuid.uuid4()}.jpg"
    img.save(UPLOAD_DIR / filename, "JPEG", quality=85)
    return filename


# ── Rate limiter ──────────────────────────────────────────────────────
# Trust X-Real-IP only from localhost (nginx), not arbitrary clients.
def _get_real_ip(request: Request) -> str:
    if request.client and request.client.host in ("127.0.0.1", "::1"):
        return request.headers.get("X-Real-IP", request.client.host)
    return request.client.host or "127.0.0.1"

limiter = Limiter(key_func=_get_real_ip)

# ── App ───────────────────────────────────────────────────────────────
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers + suspicious request logging (detection only, not blocking)
class SecurityMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        body = await request.body()
        body_str = body.decode("utf-8", errors="ignore").lower()
        if any(p.lower() in body_str for p in SUSPICIOUS_PATTERNS):
            client = request.client.host if request.client else "unknown"
            logger.warning(
                f"[SUSPICIOUS] {client} {request.method} {request.url.path} "
                f"— {body_str[:300]}"
            )
        response = await call_next(request)
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src https://fonts.gstatic.com; "
            "img-src 'self' data: blob:; "
            "frame-ancestors 'none'"
        )
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
        if "server" in response.headers:
            del response.headers["server"]
        return response


app.add_middleware(SecurityMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["Content-Type"],
)


# Global error handler — never leak stack traces
@app.exception_handler(Exception)
async def global_error_handler(request: Request, exc: Exception):
    if isinstance(exc, HTTPException):
        return JSONResponse({"detail": exc.detail}, status_code=exc.status_code)
    logger.error(f"Internal error: {exc}", exc_info=True)
    return JSONResponse({"detail": "伺服器內部錯誤"}, status_code=500)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(request: Request, exc: RequestValidationError):
    return JSONResponse({"detail": "輸入資料格式錯誤"}, status_code=422)


# ── Serve uploaded avatars ─────────────────────────────────────────────
@app.get("/uploads/{filename}")
async def serve_avatar(filename: str):
    safe_name = Path(filename).name  # strip any path components
    file_path = UPLOAD_DIR / safe_name
    resolved = file_path.resolve()
    if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):
        raise HTTPException(404)
    if not resolved.exists():
        raise HTTPException(404)
    return FileResponse(
        resolved,
        media_type="image/jpeg",
        headers={"Cache-Control": "max-age=86400"},
    )


# ── Routes ────────────────────────────────────────────────────────────

def _user_dict(user: User) -> dict:
    return {
        "id": user.id,
        "username": user.username,
        "avatar_filename": user.avatar_filename,
    }


@app.post("/api/register")
@limiter.limit("5/minute")
async def register(
    request: Request,
    username: str = Form(...),
    password: str = Form(...),
    avatar: UploadFile = File(None),
    db: Session = Depends(get_db),
):
    username = username.strip()
    if not (3 <= len(username) <= 50):
        raise HTTPException(400, "帳號長度需 3-50 字元")
    if not username.replace("_", "").isalnum():
        raise HTTPException(400, "帳號只能包含英文、數字、底線")
    if not (6 <= len(password) <= 72):
        raise HTTPException(400, "密碼長度需 6-72 字元")

    if db.query(User).filter(User.username == username).first():
        raise HTTPException(400, "無法完成註冊，請檢查輸入")

    avatar_filename = None
    if avatar and avatar.filename:
        content = await avatar.read()
        avatar_filename = validate_and_save_image(content, avatar.filename)

    user = User(
        username=username,
        hashed_password=hash_password(password),
        avatar_filename=avatar_filename,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return _user_dict(user)


@app.post("/api/login")
@limiter.limit("10/minute")
async def login(
    request: Request,
    body: LoginRequest,
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.username == body.username).first()
    # Always call verify_password to prevent timing-based account enumeration.
    # If user doesn't exist, verify against a pre-computed dummy hash (constant time).
    hashed = user.hashed_password if user else _DUMMY_HASH
    if not verify_password(body.password, hashed) or not user:
        raise HTTPException(401, "帳號或密碼錯誤")

    token = create_token(user.id)
    response = JSONResponse(_user_dict(user))
    response.set_cookie(
        key="session",
        value=token,
        httponly=True,
        samesite="strict",
        secure=True,
        max_age=TOKEN_EXPIRE_HOURS * 3600,
    )
    return response


@app.post("/api/logout")
@limiter.limit("20/minute")
async def logout(request: Request):
    response = JSONResponse({"message": "已登出"})
    response.delete_cookie("session", samesite="strict")
    return response


@app.get("/api/me")
@limiter.limit("60/minute")
async def get_me(request: Request, current_user: User = Depends(get_current_user)):
    return _user_dict(current_user)


@app.post("/api/avatar")
@limiter.limit("5/minute")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    content = await file.read()
    # Remove old avatar
    if current_user.avatar_filename:
        old = UPLOAD_DIR / current_user.avatar_filename
        if old.exists():
            old.unlink()
    filename = validate_and_save_image(content, file.filename)
    current_user.avatar_filename = filename
    db.commit()
    return {"avatar_filename": filename}


@app.get("/api/messages")
@limiter.limit("60/minute")
async def get_messages(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_optional_user),
):
    messages = (
        db.query(Message)
        .order_by(Message.created_at.desc())
        .limit(100)
        .all()
    )
    return [
        {
            "id": m.id,
            "content": m.content,
            "created_at": m.created_at.isoformat(),
            "is_own": current_user is not None and m.user_id == current_user.id,
            "author": _user_dict(m.author),
        }
        for m in messages
    ]


@app.post("/api/messages")
@limiter.limit("20/minute")
async def post_message(
    request: Request,
    body: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    clean = bleach.clean(body.content, tags=[], strip=True).strip()
    if not clean:
        raise HTTPException(400, "留言內容不能為空")

    msg = Message(content=clean, user_id=current_user.id)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return {
        "id": msg.id,
        "content": msg.content,
        "created_at": msg.created_at.isoformat(),
        "is_own": True,
        "author": _user_dict(current_user),
    }


@app.delete("/api/messages/{message_id}")
@limiter.limit("30/minute")
async def delete_message(
    request: Request,
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(404, "留言不存在")
    if msg.user_id != current_user.id:
        raise HTTPException(403, "無權限刪除此留言")
    db.delete(msg)
    db.commit()
    return {"message": "已刪除"}


# ── Serve React build (production) ────────────────────────────────────
# Must be LAST — catches all non-API routes for SPA routing
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=DIST_DIR / "assets"), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        candidate = DIST_DIR / full_path
        resolved = candidate.resolve()
        # Block path traversal (e.g. /../backend/.secret_key)
        if not str(resolved).startswith(str(DIST_DIR.resolve())):
            raise HTTPException(404)
        if resolved.exists() and resolved.is_file():
            mime, _ = mimetypes.guess_type(str(resolved))
            return FileResponse(resolved, media_type=mime or "application/octet-stream")
        # Fallback: return index.html for SPA routing
        index = DIST_DIR / "index.html"
        if index.exists():
            return FileResponse(index, media_type="text/html")
        raise HTTPException(404)
