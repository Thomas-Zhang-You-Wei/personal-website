# Windows 部署指南

## 整體流程

```
你的 Mac（開發）──build──▶ Windows 電腦（跑伺服器）──ngrok──▶ 公網
```

---

## Step 1：在你的 Mac 上 build 前端

```bash
npm run build:server
```

這會產生 `dist/` 資料夾（base 路徑是 `/`，適合自架伺服器）。

---

## Step 2：把檔案複製到 Windows 電腦

需要複製這些：

```
personal-website/
├── backend/          ← 整個資料夾
├── dist/             ← npm run build:server 產生的
└── deploy_windows/
    └── start.bat     ← 啟動腳本
```

方法：用 USB、Google Drive、或 git clone 都可以。

---

## Step 3：Windows 電腦安裝環境

1. 安裝 **Python 3.9+**
   - 下載：https://www.python.org/downloads/
   - 安裝時勾選 **"Add Python to PATH"**

2. 安裝 **ngrok**
   - 下載：https://ngrok.com/download（選 Windows）
   - 解壓縮 `ngrok.exe` 放到桌面或任意位置

---

## Step 4：設定 SECRET_KEY（重要！）

在 Windows 電腦上，於 `backend/` 資料夾裡建立 `.env` 檔：

```
backend\.env
```

內容：
```
SECRET_KEY=在這裡貼上一串隨機字串
```

產生隨機字串的方法（在 Windows CMD 執行）：
```cmd
python -c "import secrets; print(secrets.token_hex(32))"
```

---

## Step 5：啟動伺服器

雙擊 `deploy_windows/start.bat`

或在 CMD 執行：
```cmd
cd personal-website
deploy_windows\start.bat
```

看到以下訊息表示成功：
```
Uvicorn running on http://0.0.0.0:8000
```

瀏覽器打開 http://localhost:8000 確認網站正常。

---

## Step 6：用 ngrok 暴露到公網

**另開一個 CMD 視窗**，執行：

```cmd
ngrok http 8000
```

你會看到：
```
Forwarding  https://xxxx-xxx-xxx.ngrok-free.app -> http://localhost:8000
```

那個 `https://xxxx-xxx-xxx.ngrok-free.app` 就是你要提交給助教的網址。

---

## 安全注意事項

| 事項 | 說明 |
|------|------|
| 不要在 Windows 電腦存放個人重要資料 | 萬一被打穿，攻擊者可以讀取檔案 |
| 用一般帳號跑伺服器，不要用 Administrator | 降低被攻擊後的影響範圍 |
| 攻防結束後立即關閉 ngrok | 不需要繼續曝露 |
| 定期查看 backend 旁的 log 輸出 | 監控可疑攻擊 |

---

## 常見問題

**Q: ngrok 每次給的網址都不同？**
A: 免費版是的。每次重開 ngrok 要重新提交網址給助教。建議攻防期間不要重開。

**Q: 關掉 start.bat 再重開，session 還在嗎？**
A: 在，因為 SECRET_KEY 存在 `backend/.secret_key`，重開不會讓 session 失效。

**Q: Windows 防火牆擋住了怎麼辦？**
A: ngrok 走的是 443 出站連線，通常不會被擋。若有問題，允許 Python 通過防火牆。
