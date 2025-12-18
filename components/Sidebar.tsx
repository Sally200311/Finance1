import React from 'react';
import { signOut } from 'firebase/auth';
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  PieChart, 
  LogOut,
  User as UserIcon,
  Heart
} from 'lucide-react';
import { UserProfile } from '../types';
import { getFirebaseServices } from '../firebase';
import { APP_NAME } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: any) => void;
  user: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, user }) => {
  const { auth } = getFirebaseServices();

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
    } else {
      window.location.reload();
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Finny 主頁', icon: LayoutDashboard },
    { id: 'accounts', label: '我的金庫', icon: Wallet },
    { id: 'transactions', label: '記帳小本本', icon: ArrowLeftRight },
    { id: 'reports', label: '成長紀錄', icon: PieChart },
  ];

  return (
    <aside className="w-full md:w-64 bg-[#FFFBF7] border-r border-orange-50 flex flex-col h-screen sticky top-0">
      <div className="p-8">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="w-5 h-5 text-pink-400 fill-current" />
          <h1 className="text-xl font-black text-gray-800 tracking-tight">Finny App</h1>
        </div>
        <p className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Personal Finance AI</p>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-6 py-4 text-sm font-bold rounded-2xl transition-all ${
              activeTab === item.id
                ? 'bg-white shadow-sm text-pink-500'
                : 'text-gray-400 hover:bg-white hover:text-gray-600'
            }`}
          >
            <item.icon className={`w-5 h-5 mr-3 ${activeTab === item.id ? 'text-pink-400' : 'text-gray-300'}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-6">
        <div className="p-4 rounded-3xl bg-white border border-orange-50 mb-4 shadow-sm">
          <div className="flex items-center mb-2">
            <div className="bg-pink-100 p-2 rounded-full mr-3 text-sm">🦊</div>
            <div className="overflow-hidden text-ellipsis">
              <p className="text-[11px] font-bold text-gray-800 truncate">{user.email?.split('@')[0] || '訪客'}</p>
              <p className="text-[9px] text-pink-400 font-black">PRO PLAN</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 text-[10px] font-bold text-gray-300 hover:text-red-400 flex items-center justify-center transition-colors"
          >
            <LogOut className="w-3 h-3 mr-2" /> 暫時離開
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;