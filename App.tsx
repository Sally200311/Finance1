import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirebaseServices, isFirebaseEnabled } from './firebase';
import AuthView from './components/AuthView';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import { UserProfile, BankAccount, Transaction, Category } from './types';
import { DEFAULT_CATEGORIES } from './constants';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'transactions' | 'reports'>('dashboard');
  
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(DEFAULT_CATEGORIES);

  useEffect(() => {
    const { auth } = getFirebaseServices();
    
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        if (firebaseUser) {
          setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          loadInitialMockData();
        } else {
          setUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      console.warn("Firebase 未配置，進入展示模式。");
      loadInitialMockData();
      setLoading(false);
    }
  }, []);

  const loadInitialMockData = () => {
    const defaultAccounts: BankAccount[] = [
      { id: 'acc-1', name: '台新 Richart', type: '活期存款', balance: 52000, currency: 'TWD', createdAt: Date.now() },
      { id: 'acc-2', name: '國泰世華', type: '薪資帳戶', balance: 128000, currency: 'TWD', createdAt: Date.now() },
      { id: 'acc-3', name: '現金錢包', type: '現金', balance: 3500, currency: 'TWD', createdAt: Date.now() }
    ];

    const defaultTransactions: Transaction[] = [
      { id: 't1', accountId: 'acc-1', categoryId: 'cat-1', amount: 150, type: 'EXPENSE', note: '午餐便當', date: Date.now() - 3600000 },
      { id: 't2', accountId: 'acc-1', categoryId: 'cat-2', amount: 65, type: 'EXPENSE', note: '捷運扣款', date: Date.now() - 7200000 },
      { id: 't3', accountId: 'acc-2', categoryId: 'cat-6', amount: 48000, type: 'INCOME', note: '10月份薪資', date: Date.now() - 86400000 },
      { id: 't4', accountId: 'acc-3', categoryId: 'cat-1', amount: 75, type: 'EXPENSE', note: '下午茶珍奶', date: Date.now() - 43200000 }
    ];
    
    setAccounts(defaultAccounts);
    setTransactions(defaultTransactions);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FDF6F0]">
        <div className="text-center">
           <div className="w-16 h-16 border-4 border-pink-200 border-t-pink-500 rounded-full animate-spin mb-4 mx-auto"></div>
           <p className="text-pink-600 font-bold animate-pulse">Finny 正在準備您的金庫...</p>
        </div>
      </div>
    );
  }

  // 如果未登入且 Firebase 已啟用，則顯示認證頁面
  if (!user && isFirebaseEnabled()) {
    return <AuthView onLoginSuccess={(u) => {
      setUser(u);
      loadInitialMockData();
    }} />;
  }

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FDF6F0]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} user={user || { uid: 'demo', email: 'Guest User' }} />
      <main className="flex-1 p-4 md:p-8 h-screen overflow-y-auto">
        <Dashboard 
          activeTab={activeTab}
          accounts={accounts}
          transactions={transactions}
          categories={categories}
          setAccounts={setAccounts}
          setTransactions={setTransactions}
        />
      </main>
    </div>
  );
};

export default App;