import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, TrendingUp, TrendingDown, Sparkles, Target, 
  Trash2, Edit3, Wallet, ArrowRightLeft, PieChart as PieChartIcon,
  Send, Heart, CheckCircle2, X, PlusCircle, Calendar, Info
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';
import { BankAccount, Transaction, Category } from '../types';
import { getFinancialAdvice, parseQuickAdd } from '../geminiService';

interface DashboardProps {
  activeTab: string;
  accounts: BankAccount[];
  transactions: Transaction[];
  categories: Category[];
  setAccounts: React.Dispatch<React.SetStateAction<BankAccount[]>>;
  setTransactions: React.Dispatch<React.SetStateAction<Transaction[]>>;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activeTab, accounts, transactions, categories, setAccounts, setTransactions 
}) => {
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [quickAddText, setQuickAddText] = useState('');
  const [isQuickAddLoading, setIsQuickAddLoading] = useState(false);
  
  // Modals
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showEditAccount, setShowEditAccount] = useState<BankAccount | null>(null);
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Form States
  const [accName, setAccName] = useState('');
  const [accBalance, setAccBalance] = useState('');
  const [accType, setAccType] = useState('活期存款');
  const [txNote, setTxNote] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txType, setTxType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE');
  const [txCategory, setTxCategory] = useState(categories[0]?.id || '');
  const [txAccount, setTxAccount] = useState('');

  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);
  const COLORS = ['#FFADAD', '#FFD6A5', '#FDFFB6', '#CAFFBF', '#9BF6FF', '#A0C4FF', '#BDB2FF', '#FFC6FF'];

  useEffect(() => {
    if (activeTab === 'dashboard' || activeTab === 'reports') {
      handleGetAiAdvice();
    }
    if (accounts.length > 0 && !txAccount) {
      setTxAccount(accounts[0].id);
    }
  }, [activeTab, accounts.length]);

  const handleGetAiAdvice = async () => {
    if (accounts.length === 0) return;
    setAnalyzing(true);
    try {
      const advice = await getFinancialAdvice(accounts, transactions, categories);
      setAiAdvice(advice);
    } catch (e) {
      setAiAdvice("Finny 正在休息，請稍後再問我建議喔！🐾");
    }
    setAnalyzing(false);
  };

  const saveTransaction = (tx: Transaction) => {
    setTransactions(prev => [...prev, tx]);
    setAccounts(prev => prev.map(acc => {
      if (acc.id === tx.accountId) {
        return {
          ...acc,
          balance: tx.type === 'INCOME' ? acc.balance + tx.amount : acc.balance - tx.amount
        };
      }
      return acc;
    }));
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickAddText.trim() || accounts.length === 0) return;
    setIsQuickAddLoading(true);
    const parsed = await parseQuickAdd(quickAddText, categories);
    if (parsed) {
      const targetAcc = accounts[0];
      const newTransaction: Transaction = {
        id: `t-${Date.now()}`,
        accountId: targetAcc.id,
        amount: parsed.amount || 0,
        type: parsed.type || 'EXPENSE',
        note: parsed.note || 'AI 自動記帳',
        categoryId: parsed.categoryId || categories[0].id,
        date: Date.now()
      };
      saveTransaction(newTransaction);
      setQuickAddText('');
      setAiAdvice(`Finny 記好囉！已存入「${targetAcc.name}」。✨`);
    } else {
      setAiAdvice("Finny 沒聽清楚金額，請試試說：『早餐花了 100 元』");
    }
    setIsQuickAddLoading(false);
  };

  const handleDeleteAccount = (id: string) => {
    if (window.confirm("刪除帳戶會連同所有交易紀錄一起刪除，確定嗎？")) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      setTransactions(prev => prev.filter(t => t.accountId !== id));
    }
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showEditAccount || !accName) return;
    setAccounts(prev => prev.map(a => a.id === showEditAccount.id ? { ...a, name: accName } : a));
    setShowEditAccount(null);
    setAccName('');
  };

  const expenseByCategory = categories
    .filter(cat => cat.type === 'EXPENSE')
    .map(cat => ({
      name: cat.name,
      value: transactions
        .filter(t => t.categoryId === cat.id && t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
    }))
    .filter(d => d.value > 0);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6 animate-in fade-in duration-500">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="text-5xl">🦊</motion.div>
                <div>
                  <h1 className="text-3xl font-black text-gray-800">Finance 理財森林</h1>
                  <p className="text-gray-500">今天有新的收支要告訴 Finny 嗎？✨</p>
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl cute-shadow border border-pink-100 flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">目前資產總額</p>
                  <p className="text-2xl font-black text-pink-500">$ {totalBalance.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 shadow-inner">
                  <Wallet className="w-6 h-6" />
                </div>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white p-8 rounded-[2.5rem] cute-shadow border border-blue-50 relative overflow-hidden">
                  <h3 className="text-xl font-black mb-6 flex items-center text-blue-500"><Sparkles className="w-6 h-6 mr-2" /> AI 快速記帳</h3>
                  <form onSubmit={handleQuickAdd} className="relative">
                    <input type="text" value={quickAddText} onChange={(e) => setQuickAddText(e.target.value)} placeholder="例如：晚餐買了壽司 200 元" className="w-full pl-6 pr-14 py-5 bg-gray-50 border-none rounded-3xl focus:ring-4 focus:ring-blue-100 outline-none text-lg" />
                    <button type="submit" disabled={isQuickAddLoading || !quickAddText || accounts.length === 0} className="absolute right-3 top-3 bottom-3 px-5 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-30">
                      {isQuickAddLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send className="w-6 h-6" />}
                    </button>
                  </form>
                </div>

                <AnimatePresence>
                  {aiAdvice && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-yellow-50 p-6 rounded-[2rem] border border-yellow-200 flex gap-4">
                      <div className="text-3xl mt-1">💡</div>
                      <div>
                        <h4 className="font-black text-yellow-800 mb-1">Finny 的溫馨提醒</h4>
                        <p className="text-yellow-900 leading-relaxed font-medium text-sm">{aiAdvice}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="bg-white p-8 rounded-[2.5rem] cute-shadow border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-gray-800">最近腳印</h3>
                    <button onClick={() => setShowAddTransaction(true)} className="text-pink-500 font-bold hover:underline text-sm">手動記一筆</button>
                  </div>
                  <div className="space-y-4">
                    {transactions.length === 0 ? (
                      <p className="text-center py-8 text-gray-400 font-bold">尚無紀錄，快來記一筆吧！🐾</p>
                    ) : (
                      transactions.slice(-5).reverse().map(t => (
                        <div key={t.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-white border border-transparent hover:border-pink-100 transition-all">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{categories.find(c => c.id === t.categoryId)?.icon || '💸'}</span>
                            <div>
                              <p className="font-black text-sm">{t.note}</p>
                              <p className="text-[10px] text-gray-400 font-bold">{new Date(t.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <p className={`font-black ${t.type === 'INCOME' ? 'text-green-500' : 'text-rose-400'}`}>
                            {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-white p-6 rounded-[2rem] border border-purple-50 cute-shadow">
                  <h3 className="text-lg font-black mb-4 flex items-center text-purple-500"><PieChartIcon className="w-5 h-5 mr-2" /> 消費分佈</h3>
                  <div className="h-[200px]">
                    {expenseByCategory.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={expenseByCategory} innerRadius={60} outerRadius={80} dataKey="value" paddingAngle={5}>
                            {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-gray-300 font-bold">尚無支出數據</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3"><Wallet className="text-blue-500 w-8 h-8" /> 我的財富金庫</h2>
              <button onClick={() => setShowAddAccount(true)} className="px-6 py-3 bg-blue-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-blue-100 flex items-center gap-2 hover:bg-blue-600 transition-all"><Plus className="w-5 h-5" /> 新增帳戶</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {accounts.map(acc => (
                <div key={acc.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 cute-shadow relative group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[10px] font-black uppercase rounded-lg">{acc.type}</span>
                      <h3 className="text-xl font-black text-gray-800 mt-1">{acc.name}</h3>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setAccName(acc.name); setShowEditAccount(acc); }} className="p-2 text-gray-300 hover:text-blue-500 transition-all"><Edit3 className="w-5 h-5" /></button>
                      <button onClick={() => handleDeleteAccount(acc.id)} className="p-2 text-gray-300 hover:text-red-400 transition-all"><Trash2 className="w-5 h-5" /></button>
                    </div>
                  </div>
                  <p className="text-3xl font-black text-gray-900">$ {acc.balance.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        );

      case 'transactions':
        return (
          <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-right-10 duration-500">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3"><ArrowRightLeft className="text-pink-500 w-8 h-8" /> 森林紀錄小帳本</h2>
              <button onClick={() => setShowAddTransaction(true)} className="px-6 py-3 bg-pink-500 text-white rounded-[1.5rem] font-black shadow-lg shadow-pink-100 flex items-center gap-2 hover:bg-pink-600 transition-all"><PlusCircle className="w-5 h-5" /> 手動記帳</button>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 cute-shadow overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-pink-50/50">
                  <tr>
                    <th className="px-8 py-6 text-[10px] font-black text-pink-400 uppercase tracking-widest">日期</th>
                    <th className="px-8 py-6 text-[10px] font-black text-pink-400 uppercase tracking-widest">類別與內容</th>
                    <th className="px-8 py-6 text-[10px] font-black text-pink-400 uppercase tracking-widest">帳戶</th>
                    <th className="px-8 py-6 text-[10px] font-black text-pink-400 uppercase tracking-widest text-right">金額</th>
                    <th className="px-8 py-6 text-[10px] font-black text-pink-400 uppercase tracking-widest text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {transactions.slice().reverse().map(t => (
                    <tr key={t.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="px-8 py-6 text-sm font-bold text-gray-400">{new Date(t.date).toLocaleDateString()}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">{categories.find(c => c.id === t.categoryId)?.icon || '💸'}</span>
                          <div><p className="font-black text-gray-800 text-sm">{t.note}</p><p className="text-[10px] text-pink-400 font-black">{categories.find(c => c.id === t.categoryId)?.name || '未分類'}</p></div>
                        </div>
                      </td>
                      <td className="px-8 py-6"><span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-500">{accounts.find(a => a.id === t.accountId)?.name || '未知帳戶'}</span></td>
                      <td className={`px-8 py-6 text-right font-black ${t.type === 'INCOME' ? 'text-green-500' : 'text-rose-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'}${t.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <button onClick={() => setTransactions(prev => prev.filter(tx => tx.id !== t.id))} className="p-2 text-gray-200 hover:text-red-400 transition-all"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'reports':
        const incomeTotal = transactions.filter(t => t.type === 'INCOME').reduce((a, b) => a + b.amount, 0);
        const expenseTotal = transactions.filter(t => t.type === 'EXPENSE').reduce((a, b) => a + b.amount, 0);
        return (
          <div className="max-w-6xl mx-auto space-y-10 animate-in slide-in-from-right-10 duration-500 pb-20">
            <header><h2 className="text-3xl font-black text-gray-800 flex items-center gap-3"><PieChartIcon className="text-indigo-500 w-8 h-8" /> 財務成長報表</h2><p className="text-gray-400 font-bold mt-1">讓我們看看這段時間的森林變化吧！</p></header>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div className="bg-white p-10 rounded-[3rem] cute-shadow border border-gray-100">
                <h3 className="font-black text-xl mb-8">支出比例</h3>
                <div className="h-[300px]">
                  {expenseByCategory.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={expenseByCategory} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={8} dataKey="value">{expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart></ResponsiveContainer>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-300 font-bold">尚無支出紀錄可顯示</div>
                  )}
                </div>
              </div>
              <div className="bg-white p-10 rounded-[3rem] cute-shadow border border-gray-100">
                <h3 className="font-black text-xl mb-8 text-gray-700">收支總覽</h3>
                <div className="space-y-6">
                  <div className="p-6 bg-green-50 rounded-3xl flex justify-between items-center"><div className="font-black text-green-600"><p className="text-[10px] uppercase">總收入</p><p className="text-3xl">$ {incomeTotal.toLocaleString()}</p></div><div className="text-3xl">💰</div></div>
                  <div className="p-6 bg-rose-50 rounded-3xl flex justify-between items-center"><div className="font-black text-rose-600"><p className="text-[10px] uppercase">總支出</p><p className="text-3xl">$ {expenseTotal.toLocaleString()}</p></div><div className="text-3xl">💸</div></div>
                  <div className="pt-6 border-t-2 border-dashed border-gray-100 text-center"><p className="text-xs text-gray-400 font-black">淨存金額</p><p className={`text-2xl font-black ${incomeTotal - expenseTotal >= 0 ? 'text-indigo-500' : 'text-red-400'}`}>$ {(incomeTotal - expenseTotal).toLocaleString()}</p></div>
                </div>
              </div>
            </div>
            <div className="bg-indigo-600 p-10 rounded-[4rem] text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-6"><div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-4xl">🦊</div><h3 className="text-2xl font-black">Finny 深度診斷</h3></div>
                <div className="bg-white/10 p-8 rounded-3xl border border-white/20 min-h-[150px]">
                  {analyzing ? <div className="text-center py-6 font-black animate-pulse">Finny 正在分析您的財務健康度...</div> : <p className="leading-relaxed font-medium text-lg whitespace-pre-wrap">{aiAdvice || "快讓 Finny 幫您做個檢查！"}</p>}
                </div>
                <div className="mt-8 flex justify-center"><button onClick={handleGetAiAdvice} className="px-10 py-4 bg-white text-indigo-600 rounded-full font-black hover:bg-indigo-50 transition-all">重新分析 ✨</button></div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName) return;
    const newAcc: BankAccount = {
      id: `acc-${Date.now()}`,
      name: accName,
      balance: parseFloat(accBalance) || 0,
      type: accType,
      currency: 'TWD',
      createdAt: Date.now()
    };
    setAccounts(prev => [...prev, newAcc]);
    setShowAddAccount(false);
    setAccName(''); setAccBalance('');
  };

  const handleManualAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txNote || !txAmount || !txAccount || !txCategory) return;
    const newTx: Transaction = {
      id: `t-${Date.now()}`,
      accountId: txAccount,
      categoryId: txCategory,
      amount: parseFloat(txAmount),
      type: txType,
      note: txNote,
      date: Date.now()
    };
    saveTransaction(newTx);
    setShowAddTransaction(false);
    setTxNote(''); setTxAmount('');
  };

  return (
    <div className="max-w-6xl mx-auto">
      {renderTabContent()}

      {/* 新增帳戶 Modal */}
      <AnimatePresence>
        {showAddAccount && (
          <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Wallet className="text-blue-500" /> 建立新帳戶</h3>
              <form onSubmit={handleAddAccount} className="space-y-5">
                <input type="text" placeholder="名稱 (如：生活費帳戶)" value={accName} onChange={e => setAccName(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                <input type="number" placeholder="初始餘額" value={accBalance} onChange={e => setAccBalance(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                <select value={accType} onChange={e => setAccType(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                  <option>活期存款</option><option>薪資帳戶</option><option>現金</option><option>信用卡</option>
                </select>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowAddAccount(false)} className="flex-1 font-black text-gray-400">取消</button><button type="submit" className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg">建立帳戶</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 編輯帳戶 Modal */}
      <AnimatePresence>
        {showEditAccount && (
          <div className="fixed inset-0 bg-blue-900/10 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black mb-8 flex items-center gap-3 text-blue-500"><Edit3 /> 修改帳戶名稱</h3>
              <form onSubmit={handleUpdateAccount} className="space-y-5">
                <input type="text" placeholder="新名稱" value={accName} onChange={e => setAccName(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowEditAccount(null)} className="flex-1 font-black text-gray-400">取消</button><button type="submit" className="flex-[2] py-4 bg-blue-500 text-white rounded-2xl font-black shadow-lg">更新名稱</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 手動記帳 Modal */}
      <AnimatePresence>
        {showAddTransaction && (
          <div className="fixed inset-0 bg-pink-900/10 backdrop-blur-md z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
              <h3 className="text-2xl font-black mb-6 text-pink-500">森林記帳</h3>
              <form onSubmit={handleManualAddTransaction} className="space-y-5">
                <div className="flex gap-2 p-1 bg-gray-50 rounded-xl">
                  <button type="button" onClick={() => setTxType('EXPENSE')} className={`flex-1 py-2 rounded-lg font-black ${txType === 'EXPENSE' ? 'bg-pink-500 text-white' : 'text-gray-400'}`}>支出</button>
                  <button type="button" onClick={() => setTxType('INCOME')} className={`flex-1 py-2 rounded-lg font-black ${txType === 'INCOME' ? 'bg-green-500 text-white' : 'text-gray-400'}`}>收入</button>
                </div>
                <input type="text" placeholder="描述內容" value={txNote} onChange={e => setTxNote(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                <input type="number" placeholder="金額" value={txAmount} onChange={e => setTxAmount(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold" required />
                <select value={txAccount} onChange={e => setTxAccount(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <select value={txCategory} onChange={e => setTxCategory(e.target.value)} className="w-full px-6 py-4 bg-gray-50 rounded-2xl outline-none font-bold">
                  {categories.filter(c => c.type === txType).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
                <div className="flex gap-4 pt-4"><button type="button" onClick={() => setShowAddTransaction(false)} className="flex-1 font-black text-gray-400">取消</button><button type="submit" className="flex-[2] py-4 bg-pink-500 text-white rounded-2xl font-black shadow-lg">完成記帳</button></div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;