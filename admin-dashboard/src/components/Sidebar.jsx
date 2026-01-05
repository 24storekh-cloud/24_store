import React from 'react';
// Import icons ផ្ទាល់នៅទីនេះ ដើម្បីកុំឱ្យបារម្ភរឿងបោះ props ខុស
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Image as ImageIcon, 
  BarChart3,
  LogOut 
} from 'lucide-react';

const SidebarItem = ({ active, icon: Icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all duration-300
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {/* ហៅប្រើ Icon ជា Component វិញ */}
    {Icon && <Icon size={22} />} 
    <span className="text-sm font-bold tracking-tight">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab }) => {
  return (
    <div className="w-72 bg-slate-900 min-h-screen p-6 flex flex-col sticky top-0 h-screen overflow-y-auto shadow-2xl">
      
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 mb-10 group cursor-default">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/50 group-hover:rotate-12 transition-transform">
          24
        </div>
        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Store Admin
        </h1>
      </div>
      
      {/* Menu Items */}
      <nav className="flex flex-col gap-2 flex-1">
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
          label="របាយការណ៍ហិរញ្ញវត្ថុ" 
          onClick={() => setActiveTab('finance')} 
        />
      </nav>

      {/* Logout Button (Optional) */}
      <div className="mt-auto pt-6 border-t border-slate-800">
        <button className="w-full flex items-center gap-4 p-4 rounded-2xl font-black text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all">
          <LogOut size={22} />
          <span className="text-sm font-bold">ចាកចេញ</span>
        </button>
      </div>
      
    </div>
  );
};

export default Sidebar;