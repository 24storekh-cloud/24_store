import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Image as ImageIcon, 
  BarChart3,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import LogoutModal from './LogoutModal'; // កុំភ្លេច import modal ដែលយើងបង្កើត

const SidebarItem = ({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all duration-300 group
      ${active 
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-[1.02]' 
        : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'}`}
  >
    <div className={`transition-transform duration-300 ${active ? 'rotate-0' : 'group-hover:rotate-12'}`}>
      {Icon && <Icon size={22} strokeWidth={active ? 2.5 : 2} />} 
    </div>
    <span className="text-[13px] font-bold tracking-wide uppercase italic">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="w-72 bg-slate-950 min-h-screen p-6 flex flex-col sticky top-0 h-screen overflow-y-auto shadow-2xl border-r border-white/5">
      
      {/* Logo Section */}
      <div className="flex items-center gap-4 px-4 mb-12 group cursor-default">
        <div className="relative">
          <div className="w-12 h-12 bg-blue-600 rounded-[1.2rem] flex items-center justify-center font-black text-white shadow-2xl shadow-blue-600/40 rotate-3 group-hover:rotate-0 transition-all duration-500">
            24
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-950 rounded-full"></div>
        </div>
        <div>
          <h1 className="text-xl font-black text-white uppercase italic tracking-tighter leading-none">
            Store Admin
          </h1>
          <p className="text-[8px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1.5">Premium Control</p>
        </div>
      </div>
      
      {/* Menu Items */}
      <nav className="flex flex-col gap-2.5 flex-1">
        <SidebarItem 
          active={activeTab === 'dashboard'} 
          icon={LayoutDashboard} 
          label="ផ្ទាំងគ្រប់គ្រង" 
          onClick={() => setActiveTab('dashboard')} 
        />

        <SidebarItem 
          active={activeTab === 'products'} 
          icon={Package} 
          label="ផលិតផល" 
          onClick={() => setActiveTab('products')} 
        />

        <SidebarItem 
          active={activeTab === 'orders'} 
          icon={ShoppingCart} 
          label="ការកម្ម៉ង់" 
          onClick={() => setActiveTab('orders')} 
        />

        <SidebarItem 
          active={activeTab === 'banners'} 
          icon={ImageIcon} 
          label="ផ្ទាំងពាណិជ្ជកម្ម" 
          onClick={() => setActiveTab('banners')} 
        />

        <SidebarItem 
          active={activeTab === 'finance'} 
          icon={BarChart3} 
          label="របាយការណ៍" 
          onClick={() => setActiveTab('finance')} 
        />
      </nav>

      {/* Logout Section */}
      <div className="mt-auto pt-6 border-t border-white/5 space-y-4">
        <div className="px-4 py-3 bg-white/5 rounded-2xl flex items-center gap-3 border border-white/5">
           <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
              <ShieldCheck size={16} />
           </div>
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase leading-none">Status</p>
              <p className="text-[10px] font-bold text-emerald-400 uppercase mt-1">Encrypted</p>
           </div>
        </div>

        <button 
          onClick={() => setIsLogoutOpen(true)}
          className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-slate-500 hover:text-rose-400 hover:bg-rose-400/10 transition-all group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-bold uppercase italic">ចាកចេញ</span>
        </button>
      </div>

      {/* Logout Modal */}
      <LogoutModal 
        isOpen={isLogoutOpen} 
        onClose={() => setIsLogoutOpen(false)} 
        onConfirm={() => {
          setIsLogoutOpen(false);
          onLogout();
        }} 
      />
      
    </div>
  );
};

export default Sidebar;