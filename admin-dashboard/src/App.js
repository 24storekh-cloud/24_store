import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, X, 
  FileDown, BarChart3 
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
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState({ products: [], banners: [], orders: [] });
  
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

  // --- ១. កែប្រែការទាញ URL រូបភាពពី Backend Uploads ---
  const getCleanUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && img.startsWith('data:')) return img; // សម្រាប់ Base64 ចាស់
    if (typeof img === 'string' && img.startsWith('http')) return img; // សម្រាប់ URL ពេញ
    return `${API_URL}/uploads/${img}`; // សម្រាប់ឈ្មោះ File ថ្មី
  };

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data`);
      if (!res.ok) throw new Error("Server Error");
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error("Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); 
    return () => clearInterval(interval);
  }, []);

  // --- Filter Logic ---
  const filteredProducts = useMemo(() => {
    return data.products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [data.products, searchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    return data.orders.filter(order => {
      const term = orderSearch.toLowerCase();
      const matchesSearch = order.customerName.toLowerCase().includes(term) ||
                            (order.phoneNumber && order.phoneNumber.includes(term));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  // --- ២. កែសម្រួល Product Submit (ផ្ញើជា FormData) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
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

    // បន្ថែមរូបភាពទៅក្នុង FormData
    files.forEach(file => {
      form.append('images', file);
    });

    try {
      const res = await fetch(url, { 
        method: isEditMode ? 'PUT' : 'POST', 
        body: form // មិនបាច់ដាក់ Header Content-Type ទេ Browser នឹងដាក់ឱ្យអូតូ
      });
      
      if (res.ok) {
        toast.success(isEditMode ? "កែប្រែជោគជ័យ!" : "បង្កើតជោគជ័យ!");
        setIsModalOpen(false);
        setFiles([]); 
        setPreviews([]);
        fetchData();
      } else {
        const errData = await res.json();
        throw new Error(errData.error || "Upload failed");
      }
    } catch (err) { 
      toast.error(`Error: ${err.message}`); 
    }
  };

  // --- ៣. កែសម្រួល Banner Upload (ផ្ញើជា FormData មកពី BannerSection) ---
  const handleBannerUpload = async (formData) => {
    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData // ទទួលយក FormData ពី BannerSection.jsx ផ្ទាល់
      });
      if (res.ok) {
        toast.success("បង្ហោះ Banner រួចរាល់!");
        fetchData();
      } else {
        throw new Error("Server error");
      }
    } catch (err) { 
      toast.error("មិនអាចបង្ហោះ Banner បានទេ! (Error 500)"); 
    }
  };

  const handleUpdateOrderStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchData();
        toast.success("ប្តូរស្ថានភាពជោគជ័យ!");
      }
    } catch (err) { toast.error("មិនអាចប្តូរស្ថានភាពបានទេ!"); }
  };

  const handleDelete = async (type, id) => {
    if (window.confirm(`តើអ្នកពិតជាចង់លុបមែនទេ?`)) {
      try {
        const res = await fetch(`${API_URL}/api/delete/${type}/${id}`, { method: 'DELETE' });
        if(res.ok) {
            fetchData();
            toast.success("លុបរួចរាល់!");
        }
      } catch (err) { toast.error("លុបមិនបានសម្រេច!"); }
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans italic text-slate-700">
      <Toaster position="top-right" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} icons={{ LayoutDashboard, Package, ShoppingCart, ImageIcon , BarChart3}} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
           <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">Admin Panel</h2>
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Management v2.5</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase">Live Sync Active</span>
           </div>
        </header>

        {/* Dashboard Stats */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={28}/>} color="blue" />
            <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={28}/>} color="amber" />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} color="purple" />
            <StatCard label="Total Income" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`} icon={<BarChart3 size={28}/>} color="emerald" />
          </div>
        )}

        {/* Inventory Section */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Inventory</h3>
              <div className="flex gap-3">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" placeholder="ស្វែងរកទំនិញ..." 
                      className="pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                      value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                  onClick={() => { setIsEditMode(false); setFormData({name:'', price:'', cost:'', category:'phone', detail:'', stock:0}); setPreviews([]); setFiles([]); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
                ><Plus size={18}/> Add Product</button>
              </div>
            </div>
            <ProductTable 
                products={filteredProducts} 
                onEdit={(p) => { 
                    setFormData(p); 
                    setEditId(p.id); 
                    setIsEditMode(true); 
                    const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
                    setPreviews(imgs.map(img => getCleanUrl(img))); 
                    setFiles([]); 
                    setIsModalOpen(true); 
                }} 
                onDelete={handleDelete} 
            />
          </div>
        )}

        {/* Orders Section */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Customer Orders</h3>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <select 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-xs shadow-sm"
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">ទាំងអស់</option>
                  <option value="Pending">Pending</option>
                  <option value="Completed">Completed</option>
                </select>
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="text" placeholder="រកតាមឈ្មោះ/លេខ..." 
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

        {activeTab === 'banners' && (
          <BannerSection 
            banners={data.banners} 
            onDelete={handleDelete} 
            onUpload={handleBannerUpload} 
          />
        )}

        {activeTab === 'finance' && (
          <FinanceReport orders={data.orders} products={data.products} />
        )}
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

      {/* Lightbox for Payslip */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/90 z-[999] flex items-center justify-center p-6 backdrop-blur-md" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-2xl w-full flex flex-col items-center animate-in zoom-in-95">
            <button className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors">
              <X size={40} />
            </button>
            <img 
                src={selectedImg} 
                className="max-h-[80vh] w-auto rounded-3xl shadow-2xl border-4 border-white/20" 
                alt="Payment Slip" 
                onError={(e) => { e.target.src = 'https://placehold.co/600x800?text=Payslip+Not+Found'; }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;