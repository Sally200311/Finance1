import { initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import type { Auth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';

/**
 * Firebase 配置資訊
 */
const firebaseConfig = {
  apiKey: "AIzaSyDUSwwB5xuTJ8BSiJtlqAg-ZC0U63Tho5M",
  authDomain: "finance-4c728.firebaseapp.com",
  projectId: "finance-4c728",
  storageBucket: "finance-4c728.firebasestorage.app",
  messagingSenderId: "961000352486",
  appId: "1:961000352486:web:236d5bb1724c5ab4106927"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

// 檢查 API 金鑰是否已正確設定
const isConfigValid = firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase 服務初始化成功");
  } catch (error) {
    console.error("Firebase 初始化失敗:", error);
  }
} else {
  console.warn("Firebase 配置尚未完整。系統目前運行於「離線/展示模式」。");
}

/**
 * 檢查 Firebase 服務是否可用
 */
export const isFirebaseEnabled = (): boolean => auth !== null && db !== null;

/**
 * 獲取 Firebase 實例
 */
export const getFirebaseServices = () => {
  return { auth, db };
};

export { auth, db };