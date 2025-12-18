import React, { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirebaseServices, isFirebaseEnabled } from '../firebase';
import { UserProfile } from '../types';
import { Layout, LogIn, UserPlus, AlertCircle } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess: (user: UserProfile) => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { auth } = getFirebaseServices();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!auth) {
      console.warn("Operating in offline mode. Simulating login.");
      setTimeout(() => {
        onLoginSuccess({ uid: 'mock-user-123', email: email || 'demo@example.com' });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      let userCredential;
      if (isLogin) {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
      }
      onLoginSuccess({ 
        uid: userCredential.user.uid, 
        email: userCredential.user.email 
      });
    } catch (err: any) {
      let msg = '認證失敗，請檢查電子郵件與密碼';
      if (err.code === 'auth/user-not-found') msg = '找不到此使用者';
      if (err.code === 'auth/wrong-password') msg = '密碼錯誤';
      if (err.code === 'auth/email-already-in-use') msg = '此電子郵件已被註冊';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-700 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Layout className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">
            SmartFinance AI
          </h2>
          <p className="text-center text-gray-500 mb-8">
            {isLogin ? '歡迎回來，管理您的財富' : '立即加入，開啟智慧理財'}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">電子郵件</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密碼</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg flex items-center justify-center transition-colors disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isLogin ? (
                <><LogIn className="w-5 h-5 mr-2" /> 登入</>
              ) : (
                <><UserPlus className="w-5 h-5 mr-2" /> 註冊</>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {isLogin ? '還沒有帳號？立即註冊' : '已有帳號？返回登入'}
            </button>
          </div>
        </div>
        <div className="bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-400">
            {isFirebaseEnabled() ? '系統已連接 Firebase 服務' : '開發環境：系統目前運行於離線模式'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthView;