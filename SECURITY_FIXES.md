# Security Fixes — 2026-04-18

Based on penetration test reports: `SECURITY_AUDIT_claude.md`, `ATTACK_LOG_copilot_detailed.md`

---

## Fix 1 — Cookie `secure` Flag (HIGH)

**File:** `backend/main.py` — login route  
**Issue:** `secure=True` was commented out, allowing session cookies to be transmitted over HTTP in plaintext. A MITM attacker on the same network could steal the session token via ARP spoofing + traffic capture.  
**Fix:** Uncommented `secure=True` in `response.set_cookie()`.

---

## Fix 2 — CSP `script-src` removes `unsafe-inline` (MEDIUM)

**File:** `backend/main.py` — `SecurityMiddleware`  
**Issue:** `Content-Security-Policy: script-src 'self' 'unsafe-inline'` allowed any inline script to execute, rendering CSP XSS protection ineffective.  
**Fix:** Changed to `script-src 'self'`. Built React bundles are file-based and do not require `unsafe-inline`.

---

## Fix 3 — Added `Strict-Transport-Security` Header (LOW→MEDIUM)

**File:** `backend/main.py` — `SecurityMiddleware`  
**Issue:** HSTS was not set, so browsers would not enforce HTTPS even if available.  
**Fix:** Added `Strict-Transport-Security: max-age=31536000; includeSubDomains`.

---

## Fix 4 — Added `Permissions-Policy` Header (LOW)

**File:** `backend/main.py` — `SecurityMiddleware`  
**Issue:** No `Permissions-Policy` header; browsers had unrestricted access to camera, mic, geolocation APIs.  
**Fix:** Added `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

---

## Fix 5 — Rate Limiting on Unprotected Endpoints (MEDIUM)

**File:** `backend/main.py`  
**Issue:** `GET /api/messages`, `GET /api/me`, and `POST /api/logout` had no rate limits, enabling unlimited polling, scraping, or token probing.  
**Fix:**
- `GET /api/messages` → `@limiter.limit("60/minute")`
- `GET /api/me` → `@limiter.limit("60/minute")`
- `POST /api/logout` → `@limiter.limit("20/minute")`

---

## Fix 6 — Rate Limiter Proxy-Aware IP Detection (MEDIUM)

**File:** `backend/main.py` — `_get_real_ip()`  
**Issue:** Using `get_remote_address` from slowapi trusts `X-Forwarded-For` when `--proxy-headers` is active, allowing attackers to forge IP headers and bypass rate limits.  
**Fix:** Replaced with `_get_real_ip()`: only trusts `X-Real-IP` when the connection originates from localhost (nginx). External clients cannot spoof their IP.

---

## Fix 7 — Username Enumeration via Register Endpoint (LOW)

**File:** `backend/main.py` — `/api/register`  
**Issue:** Returning `"此帳號已存在"` allowed automated scripts to enumerate valid usernames by observing different error messages.  
**Fix:** Unified error message to `"無法完成註冊，請檢查輸入"`, indistinguishable from other validation failures.

---

## Fix 8 — WAF Clarified as Logging-Only (INFO)

**File:** `backend/main.py` — `SecurityMiddleware`  
**Issue:** The `SecurityMiddleware` only logs suspicious patterns but does not block requests, potentially giving developers a false sense of security.  
**Fix:** Updated comment to `# Security headers + suspicious request logging (detection only, not blocking)` to clearly document intended behavior.

---

## Issues Accepted / Not Fixed

| Issue | Reason |
|-------|--------|
| CSP `style-src 'unsafe-inline'` | React and Google Fonts require inline styles; removing it would break the UI |
| JWT payload base64-decodable | Normal behavior for HS256 JWT; payload is signed, not encrypted — no sensitive data in payload |
| Timing leak on login | Already mitigated with dummy hash constant-time check; remaining gap is negligible |
| `user_id` in message API response | Required by frontend to show/hide the delete button; low risk since usernames are already public |
| Account lockout mechanism | Requires Redis or DB-tracked failure counts; deferred to future iteration |
