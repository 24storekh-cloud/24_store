import React, { useState, useEffect, useMemo, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, X, 
  BarChart3, RefreshCcw, Wifi, WifiOff,
  Database, TrendingUp
} from 'lucide-react';
import API_URL from './apiConfig'; 
import Sidebar from './components/Sidebar';
import StatCard from './components/StatCard';
import ProductTable from './components/ProductTable';
import OrderTable from './components/OrderTable';
import ProductModal from './components/ProductModal';
import BannerSection from './components/BannerSection';
import FinanceReport from './components/FinanceReport';

const AdminDashboard = ({ token, onLogout }) => {
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

  // Helper សម្រាប់ទាញ Token (ករណី refresh page)
  const getAuthHeader = useCallback(() => ({
    'Authorization': `Bearer ${token || localStorage.getItem('adminToken')}`
  }), [token]);

  // --- ១. អនុគមន៍ជំនួយសម្រាប់សម្អាត URL រូបភាព ---
  const getCleanUrl = useCallback((img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && (img.startsWith('data:') || img.startsWith('blob:'))) return img;
    
    if (typeof img === 'string' && img.startsWith('http')) {
      if (!window.location.hostname.includes('localhost')) {
        return img.replace('http://', 'https://');
      }
      return img;
    }

    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanPath = typeof img === 'string' ? img.replace('uploads/', '') : '';
    return `${baseUrl}/uploads/${cleanPath}`; 
  }, []);

  // --- ២. ទាញទិន្នន័យពី API (មានភ្ជាប់ Token) ---
  const fetchData = useCallback(async (showSilent = false) => {
    if (!navigator.onLine) return;
    if (!showSilent) setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/data`, {
        headers: getAuthHeader()
      });
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
  }, [getAuthHeader]);

  useEffect(() => {
    fetchData();
    const handleOnline = () => { setIsOnline(true); fetchData(true); };
    const handleOffline = () => { setIsOnline(false); };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    const interval = setInterval(() => fetchData(true), 30000); 
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [fetchData]);

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return (data.products || []).filter(product => {
      const name = product.name || "";
      const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.products, searchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    return [...(data.orders || [])].reverse().filter(order => {
      const term = orderSearch.toLowerCase();
      const customerName = (order.customerName || "").toLowerCase();
      const phone = (order.phoneNumber || order.customerPhone || "").toString();
      const matchesSearch = customerName.includes(term) || phone.includes(term);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  // --- API Actions (Submit/Update/Delete - ទាំងអស់មានភ្ជាប់ Token) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading("កំពុងរក្សាទុក...");
    const url = isEditMode ? `${API_URL}/api/update/product/${editId}` : `${API_URL}/api/upload`;
    
    const form = new FormData();
    form.append('type', 'product');
    Object.keys(formData).forEach(key => form.append(key, formData[key]));
    if (files.length > 0) files.forEach(file => form.append('images', file));

    try {
      const res = await fetch(url, { 
        method: isEditMode ? 'PUT' : 'POST', 
        headers: getAuthHeader(), 
        body: form 
      });
      if (res.ok) {
        toast.success("រក្សាទុកជោគជ័យ!", { id: loadingToast });
        setIsModalOpen(false);
        fetchData(true);
      } else { throw new Error(); }
    } catch (err) { toast.error("បរាជ័យក្នុងការរក្សាទុក!", { id: loadingToast }); }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success("បច្ចុប្បន្នភាពស្ថានភាពរួចរាល់");
        fetchData(true);
      }
    } catch (err) { toast.error("មិនអាចប្តូរស្ថានភាពបានទេ!"); }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      const res = await fetch(`${API_URL}/api/update/product/${id}`, {
        method: 'PUT',
        headers: { 
          ...getAuthHeader(),
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ stock: Number(newStock) })
      });
      if (res.ok) {
        toast.success("អាប់ដេតស្តុកជោគជ័យ");
        fetchData(true);
      }
    } catch (err) { toast.error("បរាជ័យ!"); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`តើអ្នកពិតជាចង់លុប ${type} នេះមែនទេ?`)) return;
    const loadingToast = toast.loading("កំពុងលុប...");
    try {
      const res = await fetch(`${API_URL}/api/delete/${type}/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (res.ok) { 
        toast.success("លុបបានជោគជ័យ", { id: loadingToast }); 
        fetchData(true); 
      }
    } catch (error) { toast.error("មានបញ្ហាក្នុងការលុប!", { id: loadingToast }); }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans selection:bg-blue-100 selection:text-blue-600">
      <Toaster position="top-right" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-h-screen custom-scrollbar">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div>
            <h2 className="text-4xl font-black text-slate-800 uppercase italic tracking-tighter flex items-center gap-3">
              <Database className="text-blue-600" size={32} /> Admin Portal
            </h2>
            <div className="flex items-center gap-3 mt-2">
              <p className={`text-[9px] font-black uppercase tracking-widest ${isOnline ? 'text-emerald-500' : 'text-rose-500'}`}>
                 {isOnline ? '● System Online' : '● Connection Lost'}
              </p>
              <span className="text-slate-300 text-[9px] font-bold uppercase tracking-widest">v2.6.4 Stable</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => fetchData()} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-400 hover:text-blue-600 transition-all active:scale-90">
              <RefreshCcw size={22} className={loading ? "animate-spin text-blue-600" : ""} />
            </button>
            <div className="h-10 w-[1px] bg-slate-200 mx-2"></div>
            <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-2xl border border-slate-100 shadow-sm">
               <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black italic">A</div>
               <div className="hidden sm:block">
                  <p className="text-[10px] font-black uppercase leading-none">Super Admin</p>
                  <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Authorized</p>
               </div>
            </div>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-10 animate-in fade-in duration-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard label="Products" count={data.products.length} icon={<Package size={28}/>} color="blue" />
              <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={28}/>} color="amber" />
              <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} color="purple" />
              <StatCard label="Total Revenue" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`} icon={<BarChart3 size={28}/>} color="emerald" />
            </div>
            <div className="bg-white p-20 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-center italic text-slate-300 font-bold uppercase tracking-widest text-center">
               Analytics Dashboard Ready for Deployment
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
               <div>
                  <h3 className="text-2xl font-black uppercase italic text-slate-800">Inventory Control</h3>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Manage and track your products</p>
               </div>
               <button 
                 onClick={() => { 
                   setIsEditMode(false); 
                   setFormData({name:'', price:'', cost:'', category:'phone', detail:'', stock:0}); 
                   setPreviews([]); setFiles([]); setIsModalOpen(true); 
                 }}
                 className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all uppercase italic text-sm tracking-widest"
               >
                 <Plus size={20} strokeWidth={3} /> Add New Item
               </button>
            </div>
            
            <div className="relative group">
               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
               <input 
                 type="text" placeholder="Search by name or category..." 
                 className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[1.5rem] outline-none font-bold shadow-sm focus:ring-4 focus:ring-blue-500/10 transition-all"
                 value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>

            <ProductTable 
              products={filteredProducts} 
              onEdit={(p) => { 
                setFormData(p); setEditId(p.id || p._id); setIsEditMode(true); 
                const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
                setPreviews(imgs.map(img => getCleanUrl(img))); 
                setIsModalOpen(true); 
              }} 
              onDelete={(id) => handleDelete('product', id)}
              onUpdateStock={handleUpdateStock}
              getCleanUrl={getCleanUrl}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <h3 className="text-2xl font-black uppercase italic text-slate-800">Order Management</h3>
            <OrderTable 
              orders={filteredOrders} 
              onUpdateStatus={handleUpdateOrderStatus} 
              onDelete={(id) => handleDelete('order', id)} 
              onViewPayslip={(url) => setSelectedImg(getCleanUrl(url))} 
            />
          </div>
        )}

        {activeTab === 'banners' && (
          <BannerSection 
            banners={data.banners} 
            onDelete={(id) => handleDelete('banner', id)} 
            onUpload={fetchData} 
            getCleanUrl={getCleanUrl} 
          />
        )}

        {activeTab === 'finance' && <FinanceReport orders={data.orders} products={data.products} />}
      </main>

      <ProductModal 
        isOpen={isModalOpen} isEditMode={isEditMode} formData={formData} setFormData={setFormData}
        onClose={() => setIsModalOpen(false)} onSubmit={handleProductSubmit}
        onFileChange={(e) => {
          const sFiles = Array.from(e.target.files);
          setFiles(sFiles);
          setPreviews(sFiles.map(f => URL.createObjectURL(f)));
        }} 
        previews={previews}
      />

      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/95 z-[999] flex items-center justify-center p-6 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button className="absolute -top-12 right-0 text-white hover:text-red-500" onClick={() => setSelectedImg(null)}>
              <X size={32} />
            </button>
            <img src={selectedImg} className="w-full rounded-[2.5rem] shadow-2xl" alt="Payslip" />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;