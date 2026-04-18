# 🔓 Personal Website Security Penetration Test Report

**攻击者：** GitHub Copilot (AI Red Teamer)  
**目标：** http://127.0.0.1:8001  
**测试日期：** 2026-04-18 08:32:18  

---

## Attack 1: API Enumeration

**描述：** 发现所有 API 端点

**结果：** ✓ 成功

---

## Attack 2: Username Enumeration

**描述：** 通过错误消息差异枚举用户

**结果：** ✓ 可以枚举

---

## Attack 3: SQL Injection

**描述：** 尝试 SQL 注入

**结果：** ✓ 防护成功

---

## Attack 4: XSS

**描述：** 注入 JavaScript

**结果：** ✓ 防护成功

---

## Attack 5: Path Traversal

**描述：** 绕过路径限制

**结果：** 🔴 失败

---

## Attack 6: IDOR

**描述：** 访问其他用户资源

**结果：** ✓ 删除需要验证

---

## Attack 7: Session Cookie

**描述：** 分析安全头设置

**结果：** ⚠️ 高危: secure flag 未启用
✓ httponly 已启用
✓ samesite=strict

---

## Attack 8: Rate Limiting

**描述：** 检查速率限制

**结果：** ✓ /api/register: 5/min
✓ /api/login: 10/min
⚠️ /api/messages: 无限制

---

