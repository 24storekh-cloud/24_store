import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, X, 
  BarChart3, RefreshCcw, Wifi, WifiOff
} from 'lucide-react';

import API_URL from './apiConfig'; 
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import ProductTable from './components/ProductTable';
import OrderTable from './components/OrderTable';
import ProductModal from './components/ProductModal';
import BannerSection from './components/BannerSection';
import FinanceReport from './components/FinanceReport';

const AdminDashboard = () => {
  // --- States ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ products: [], banners: [], orders: [] });
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', cost: '', category: 'phone', detail: '', stock: 0 });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);

  // --- ១. អនុគមន៍ជំនួយសម្រាប់សម្អាត URL រូបភាព (ដោះស្រាយបញ្ហា Mixed Content) ---
  const getCleanUrl = useCallback((img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    
    if (typeof img === 'string' && (img.startsWith('data:') || img.startsWith('blob:'))) return img;
    
    if (typeof img === 'string' && img.startsWith('http')) {
      // បើនៅលើ Server (Vercel) ទើបប្តូរទៅ HTTPS ដើម្បីដោះស្រាយ Mixed Content Error
      if (!window.location.hostname.includes('localhost')) {
        return img.replace('http://', 'https://');
      }
      return img;
    }

    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanPath = img.replace('uploads/', '');
    return `${baseUrl}/uploads/${cleanPath}`; 
  }, []);

  // --- ២. ទាញទិន្នន័យពី API (Auto Update Logic) ---
  const fetchData = async (showSilent = false) => {
    if (!showSilent) setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/data`);
      if (!res.ok) throw new Error("Server Connection Failed");
      const result = await res.json();
      setData({
        products: result.products || [],
        banners: result.banners || [],
        orders: result.orders || []
      });
    } catch (err) {
      if (!showSilent) toast.error("មិនអាចទាញទិន្នន័យបានទេ!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // ពិនិត្យស្ថានភាព Internet
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Auto-refresh រាល់ ៣០ វិនាទី ដើម្បីទទួលបាន Order ថ្មីៗ
    const interval = setInterval(() => fetchData(true), 30000); 
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- ៣. ការចម្រោះទិន្នន័យ (Memoized Filter) ---
  const filteredProducts = useMemo(() => {
    return data.products.filter(product => {
      const matchesSearch = (product.name || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.products, searchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    return [...data.orders].reverse().filter(order => {
      const term = orderSearch.toLowerCase();
      const customerName = (order.customerName || "").toLowerCase();
      const phone = (order.customerPhone || "").toString();
      const matchesSearch = customerName.includes(term) || phone.includes(term);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  // --- ៤. ការបញ្ជូនទិន្នន័យ Product (Add/Update) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading(isEditMode ? "កំពុងកែប្រែ..." : "កំពុងបញ្ចូល...");
    
    // ១. កំណត់ URL (បើ Edit ត្រូវមាន ID នៅខាងចុង)
    const url = isEditMode 
      ? `${API_URL}/api/update/product/${editId}` 
      : `${API_URL}/api/upload`;

    const form = new FormData();
    form.append('type', 'product');
    form.append('name', formData.name);
    form.append('price', formData.price);
    form.append('cost', formData.cost || 0);
    form.append('category', formData.category);
    form.append('detail', formData.detail);
    form.append('stock', formData.stock);

    // បើមានរូបភាពថ្មី ត្រូវបញ្ជូនទៅដែរ
    files.forEach(file => form.append('images', file));

    try {
      const res = await fetch(url, { 
        method: isEditMode ? 'PUT' : 'POST', // បើកែប្រើ PUT
        body: form 
      });
      
      if (res.ok) {
        toast.success("រក្សាទុកជោគជ័យ!", { id: loadingToast });
        setIsModalOpen(false);
        fetchData(true); // ទាញទិន្នន័យថ្មីពី server មកបង្ហាញភ្លាមៗ
      }
    } catch (err) { 
      toast.error("បញ្ហាការតភ្ជាប់!"); 
    }
  };

  // --- ៥. ការគ្រប់គ្រងស្ថានភាព Order ---
  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData(true);
        toast.success(`ស្ថានភាពប្តូរទៅ ${newStatus}`);
      }
    } catch (err) { toast.error("ប្តូរស្ថានភាពមិនបានជោគជ័យ!"); }
  };

  const handleUpdateStock = async (id, newStock) => {
    if (newStock < 0) return;
    try {
      const res = await fetch(`${API_URL}/api/update/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: newStock })
      });
      if (res.ok) {
        setData(prev => ({
          ...prev,
          products: prev.products.map(p => (p.id === id || p._id === id) ? { ...p, stock: newStock } : p)
        }));
      }
    } catch (err) { toast.error("Error updating stock"); }
  };

  // --- ៦. ការលុបទិន្នន័យ ---
  // --- ៦. ការលុបទិន្នន័យ (កែសម្រួលឱ្យកាន់តែរឹងមាំ) ---
  const handleDelete = async (type, id) => {
    if (!id) return toast.error("រកមិនឃើញ ID សម្រាប់លុបទេ!");

    // បន្ថែមការសួរបញ្ជាក់ (Confirm Dialog)
    const isConfirmed = window.confirm(`តើអ្នកពិតជាចង់លុប ${type} នេះមែនទេ?`);
    if (!isConfirmed) return;

    const loadingToast = toast.loading("កំពុងលុប...");

    try {
      const res = await fetch(`${API_URL}/api/delete/${type}/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
          toast.success("លុបបានជោគជ័យ", { id: loadingToast });
          // ហៅ fetchData(true) ដើម្បី Update UI ដោយមិនចាំបាច់ Loading ធំកណ្តាលអេក្រង់
          fetchData(true); 
      } else {
          const errData = await res.json();
          throw new Error(errData.message || "Delete Failed");
      }
    } catch (error) {
      console.error("Delete Error:", error);
      toast.error("មានបញ្ហាក្នុងការលុប!", { id: loadingToast });
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans text-slate-700">
      <Toaster position="top-right" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-800 uppercase italic">Admin Panel</h2>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Store Management v2.6</p>
                {isOnline ? <Wifi size={12} className="text-green-500" /> : <WifiOff size={12} className="text-red-500" />}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => fetchData()} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all active:rotate-180">
                 <RefreshCcw size={20} className={loading ? "animate-spin text-blue-600" : ""} />
              </button>
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                 <div className={`w-2 h-2 rounded-full ${loading ? 'bg-amber-400 animate-pulse' : 'bg-green-500'}`}></div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                   {loading ? 'Updating...' : 'System Live'}
                 </span>
              </div>
            </div>
        </header>

        {/* Dashboard View */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={28}/>} color="blue" />
            <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={28}/>} color="amber" />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} color="purple" />
            <StatCard label="Total Revenue" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`} icon={<BarChart3 size={28}/>} color="emerald" />
          </div>
        )}

        {/* Inventory View */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Inventory</h3>
              <div className="flex gap-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="Search product..." 
                      className="pl-12 pr-4 py-3 bg-white border border-slate-100 rounded-2xl outline-none font-bold shadow-sm focus:ring-2 focus:ring-blue-500"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                  onClick={() => { setIsEditMode(false); setFormData({name:'', price:'', cost:'', category:'phone', detail:'', stock:0}); setPreviews([]); setFiles([]); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
                ><Plus size={18}/> New Item</button>
              </div>
            </div>
            <ProductTable 
                products={filteredProducts} 
                onEdit={(p) => { 
                    setFormData(p); 
                    setEditId(p.id || p._id); 
                    setIsEditMode(true); 
                    const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
                    setPreviews(imgs.map(img => getCleanUrl(img))); 
                    setFiles([]); 
                    setIsModalOpen(true); 
                }} 
                onDelete={(type, id) => handleDelete(type, id)}
                onUpdateStock={handleUpdateStock}
                getCleanUrl={getCleanUrl}
            />
          </div>
        )}

        {/* Order View */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Customer Orders</h3>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-black text-[10px] uppercase shadow-sm cursor-pointer"
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="Search by name/phone..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-xs shadow-sm"
                    value={orderSearch} onChange={(e) => setOrderSearch(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <OrderTable 
                orders={filteredOrders} 
                onUpdateStatus={handleUpdateOrderStatus} 
                onDelete={(id) => handleDelete('order', id)} 
                onViewPayslip={(url) => setSelectedImg(getCleanUrl(url))} 
            />
          </div>
        )}

        {activeTab === 'banners' && (<BannerSection banners={data.banners} onDelete={(id) => handleDelete('banner', id)} onUpload={fetchData} getCleanUrl={getCleanUrl} />)}

        {activeTab === 'finance' && (
          <FinanceReport orders={data.orders} products={data.products} />
        )}
      </main>

      {/* Product Modal */}
      <ProductModal 
        isOpen={isModalOpen} isEditMode={isEditMode} formData={formData} setFormData={setFormData}
        onClose={() => setIsModalOpen(false)} onSubmit={handleProductSubmit}
        onFileChange={(e) => {
          const sFiles = Array.from(e.target.files);
          setFiles(sFiles);
          if (previews.some(p => p.startsWith('blob:'))) previews.forEach(p => URL.revokeObjectURL(p));
          setPreviews(sFiles.map(f => URL.createObjectURL(f)));
        }} 
        previews={previews}
      />

      {/* Payslip Viewer (LightBox) */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/90 z-[999] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-sm w-full animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white hover:text-red-500" onClick={() => setSelectedImg(null)}>
              <X size={40} />
            </button>
            <img src={selectedImg} className="w-full h-auto rounded-[2rem] shadow-2xl border-4 border-white" alt="Slip" onError={(e) => e.target.src = 'https://placehold.co/400x600?text=Slip+Not+Found'} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;