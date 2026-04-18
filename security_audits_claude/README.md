# Security Audits — Claude Red Team

| 檔案 | 說明 |
|------|------|
| SECURITY_AUDIT_round1_claude.md | Round 1 — 初始程式碼審計（修復前） |
| SECURITY_AUDIT_round2_claude.md | Round 2 — 修復後再攻擊（發現新漏洞） |

## 重點發現
- **Round 1 最高嚴重性：** HIGH — Cookie 缺少 `secure` flag
- **Round 2 最高嚴重性：** CRITICAL — SPA 路由 Path Traversal，可竊取 JWT 密鑰並偽裝任意用戶
