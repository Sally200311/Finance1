import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

/**
 * 嘗試從環境變數解析 Firebase 配置
 */
const getFirebaseConfig = () => {
  try {
    const config = process.env.FIREBASE_CONFIG;
    if (config && config !== "undefined" && config !== "") {
      return JSON.parse(config);
    }
  } catch (e) {
    console.error("無法解析 FIREBASE_CONFIG 秘密資訊:", e);
  }
  return null;
};

const firebaseConfig = getFirebaseConfig();

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (firebaseConfig && firebaseConfig.apiKey) {
  try {
    // 初始化 Firebase v9 服務
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase 服務已透過生產環境配置啟動。");
  } catch (error) {
    console.error("Firebase 初始化失敗:", error);
  }
} else {
  console.warn("未偵測到 Firebase 配置資訊。系統將運行於「展示模式」。");
}

/**
 * 檢查 Firebase 服務是否可用
 */
export const isFirebaseEnabled = (): boolean => auth !== null && db !== null;

/**
 * 獲取 Firebase 服務實例 (含型別檢查)
 */
export const getFirebaseServices = () => {
  return { auth, db };
};

export { auth, db };