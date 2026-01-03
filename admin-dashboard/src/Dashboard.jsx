import React, { useState, useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, Image as ImageIcon, ShoppingCart, 
  Plus, Bell, Search, Filter 
} from 'lucide-react';

// Import Components ដែលយើងទើបបំបែក
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ products: [], banners: [], orders: [] });

  // ទាញទិន្នន័យពី Server
  const fetchData = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/data');
      const result = await res.json();
      setData(result);
    } catch (err) { toast.error("Error loading data"); }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Auto update រៀងរាល់ 5 វិនាទី
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans">
      <Toaster position="top-right" />
      
      {/* Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        icons={{ LayoutDashboard, Package, ShoppingCart, ImageIcon }} 
      />

      {/* Main Content */}
      <main className="flex-1 p-10">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">Control Panel</h2>
            <p className="text-slate-400 text-sm font-medium">គ្រប់គ្រងហាងរបស់អ្នកនៅទីនេះ</p>
          </div>
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-white flex items-center gap-4">
             <Bell className="text-slate-400" />
             <div className="w-10 h-10 bg-slate-200 rounded-2xl"></div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={28}/>} />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} />
            <StatCard label="Total Orders" count={data.orders.length} icon={<ShoppingCart size={28}/>} />
          </div>
        )}

        {/* បងអាចបំបែក ProductTable និង OrderTable បន្ថែមទៀតបានតាមរបៀបដូចគ្នា */}
      </main>
    </div>
  );
};

export default Dashboard;