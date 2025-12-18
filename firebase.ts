import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Firebase 配置資訊
 * 由於使用者要求不使用 GitHub Secrets，因此將配置直接放置於此。
 * 請將下方的佔位符替換為您從 Firebase 控制台取得的實際金鑰。
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

// 檢查是否已填寫實際金鑰，若未填寫則進入展示模式
const isConfigValid = firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";

if (isConfigValid) {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log("Firebase initialized successfully for project: finance");
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
} else {
  console.warn("Firebase configuration not set. Please update firebase.ts with your credentials. App running in Offline/Demo mode.");
}

export const isFirebaseEnabled = (): boolean => auth !== null && db !== null;

export const getFirebaseServices = () => {
  return { auth, db };
};

export { auth, db };