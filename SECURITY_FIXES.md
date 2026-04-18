# Security Fixes

---

## Round 2 — 2026-04-18 (based on `security_audits_claude/SECURITY_AUDIT_round2_claude.md`)

### Fix R2-1 — SPA Route Path Traversal (CRITICAL)

**File:** `backend/main.py` — `serve_spa`  
**Issue:** `serve_spa` directly joined user-supplied `full_path` to `DIST_DIR` without boundary validation. An attacker could request `/%2e%2e/backend/.secret_key` to read the JWT signing key, then forge tokens for any user. Also exposed `app.db` (all password hashes) and `main.py`.  
**Fix:** Added `resolved = candidate.resolve()` + boundary check mirroring the existing `/uploads/` protection: reject if `resolved` does not start with `DIST_DIR.resolve()`.

---

### Fix R2-2 — Dummy Hash Invalid Format (MEDIUM)

**File:** `backend/main.py` — module level + `login`  
**Issue:** The inline dummy hash `"$2b$12$invalidhashfortimingatk.AAAA..."` had 52 chars after `$2b$12$` instead of the required 53, causing `bcrypt.checkpw` to raise `Invalid salt` immediately (0 ms). This restored the ~167 ms timing difference between "user exists" and "user not found", enabling account enumeration via timing.  
**Fix:** Moved dummy hash to module-level constant `_DUMMY_HASH`, pre-computed at startup with `bcrypt.hashpw(b"__dummy_placeholder__", bcrypt.gensalt())`. This guarantees a syntactically valid hash with the same cost factor as real passwords, so `checkpw` always runs the full computation.

---

### Fix R2-3 — `DELETE /api/messages` Missing Rate Limit (MEDIUM)

**File:** `backend/main.py` — `delete_message`  
**Issue:** No rate limit on `DELETE /api/messages/{id}`, allowing an attacker to sequentially delete all messages (IDs 1, 2, 3 …) within seconds.  
**Fix:** Added `@limiter.limit("30/minute")` and `request: Request` parameter.

---

### Fix R2-4 — `user_id` Exposed in API Response (INFO)

**Files:** `backend/main.py`, `src/App.jsx`  
**Issue:** `GET /api/messages` and `POST /api/messages` returned raw integer `user_id`, an internal DB identifier that has no business being public.  
**Fix:**
- Backend: Added `get_optional_user` dependency (reads cookie without raising on failure). `get_messages` now accepts optional auth and returns `is_own: bool` instead of `user_id`.
- Frontend `App.jsx:610`: Changed `user?.id === msg.user_id` → `msg.is_own`.

---

## Round 1 — 2026-04-18 (based on `SECURITY_AUDIT_claude.md`, `ATTACK_LOG_copilot_detailed.md`)

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
| Timing leak on login | Fixed in Round 2 with a valid pre-computed dummy hash |
| `user_id` in message API response | Fixed in Round 2 with `is_own` boolean |
| Account lockout mechanism | Requires Redis or DB-tracked failure counts; deferred to future iteration |
