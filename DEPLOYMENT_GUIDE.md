
# SmartFinance AI 部署指南

這份指南將協助您將財務管理系統部署到 GitHub Pages。

## 第一步：準備 Firebase
1. 前往 [Firebase Console](https://console.firebase.google.com/)。
2. 點擊「新增專案」，輸入專案名稱。
3. 在專案概覽中，點擊「Web」圖示 (`</>`) 以新增應用程式。
4. 複製產生的 `firebaseConfig` 物件（包含 `apiKey`, `authDomain` 等）。
5. 在 Firebase 側邊欄，前往「Build」->「Authentication」，啟用「Email/Password」登入方式。
6. 前往「Firestore Database」，建立資料庫並設定為「測試模式」。

## 第二步：獲取 Google AI API Key
1. 前往 [Google AI Studio](https://aistudio.google.com/)。
2. 點擊「Get API Key」並建立一組新的金鑰。

## 第三步：設定 GitHub Repository Secrets
1. 在您的 GitHub 儲存庫頁面，點擊「Settings」。
2. 點擊左側選單的「Secrets and variables」->「Actions」。
3. 點擊「New repository secret」新增以下兩個秘密：
   - **名稱**：`API_KEY`
     - **內容**：填入您的 Google AI API 金鑰。
   - **名稱**：`FIREBASE_CONFIG`
     - **內容**：填入整個 Firebase 配置 JSON 字串。範例：
       ```json
       {"apiKey": "...", "authDomain": "...", "projectId": "...", ...}
       ```

## 第四步：啟用 GitHub Pages
1. 在 GitHub 儲存庫的「Settings」中。
2. 點擊左側選單的「Pages」。
3. 在「Build and deployment」下的「Source」選擇 **GitHub Actions**。

## 第五步：部署
1. 將代碼推送（Push）到 `main` 分支。
2. GitHub Actions 會自動啟動 `Build and Deploy` 工作流。
3. 完成後，您可以在「Pages」頁面看到部署成功的網址。

### 注意事項
- 系統已設定 `base: './'`，這能防止 GitHub Pages 出現空白頁面的路徑錯誤。
- 如果沒設定環境變數，系統會自動切換為「離線展示模式」，方便開發測試。
