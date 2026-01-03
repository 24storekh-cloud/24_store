import React from 'react';

// Component តូចសម្រាប់បង្ហាញប៊ូតុងនីមួយៗក្នុង Sidebar
const SidebarItem = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    className={`w-full flex items-center gap-4 p-4 rounded-2xl font-black transition-all 
      ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-105' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
  >
    {/* បង្ហាញ Icon ប្រសិនបើវាមានអត្ថិភាព */}
    {icon && icon} 
    <span className="text-sm">{label}</span>
  </button>
);

const Sidebar = ({ activeTab, setActiveTab, icons }) => {
  return (
    <div className="w-72 bg-slate-900 min-h-screen p-6 flex flex-col gap-2 sticky top-0 h-screen overflow-y-auto">
      {/* Logo Section */}
      <div className="flex items-center gap-3 px-4 mb-10">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-600/50">
          24
        </div>
        <h1 className="text-xl font-black text-white uppercase italic tracking-tighter">
          Store Admin
        </h1>
      </div>
      
      {/* Menu Items */}
      <SidebarItem 
        active={activeTab === 'dashboard'} 
        icon={icons.LayoutDashboard ? <icons.LayoutDashboard size={22}/> : null} 
        label="ផ្ទាំងគ្រប់គ្រង" 
        onClick={() => setActiveTab('dashboard')} 
      />

      <SidebarItem 
        active={activeTab === 'products'} 
        icon={icons.Package ? <icons.Package size={22}/> : null} 
        label="ផលិតផល" 
        onClick={() => setActiveTab('products')} 
      />

      <SidebarItem 
        active={activeTab === 'orders'} 
        icon={icons.ShoppingCart ? <icons.ShoppingCart size={22}/> : null} 
        label="ការកម្ម៉ង់" 
        onClick={() => setActiveTab('orders')} 
      />

      <SidebarItem 
        active={activeTab === 'banners'} 
        icon={icons.ImageIcon ? <icons.ImageIcon size={22}/> : null} 
        label="ផ្ទាំងពាណិជ្ជកម្ម" 
        onClick={() => setActiveTab('banners')} 
      />

      {/* ប៊ូតុងថ្មីសម្រាប់ Finance */}
      <SidebarItem 
        active={activeTab === 'finance'} 
        icon={icons.BarChart3 ? <icons.BarChart3 size={22}/> : null} 
        label="របាយការណ៍ហិរញ្ញវត្ថុ" 
        onClick={() => setActiveTab('finance')} 
      />

      {/* បងអាចបន្ថែមប៊ូតុង Logout នៅខាងក្រោមនេះបានបើចង់ */}
    </div>
  );
};

export default Sidebar;