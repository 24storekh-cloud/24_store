import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, X, 
  FileDown, BarChart3
} from 'lucide-react';

// --- Import API Config ---
import API_URL from './apiConfig'; 

// --- Import Custom Components ---
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
  const [formData, setFormData] = useState({ name: '', price: '', category: 'phone', detail: '', stock: 0 });
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [selectedImg, setSelectedImg] = useState(null);

  // --- ១. មុខងារជំនួយសម្រាប់ URL រូបភាព (គាំទ្រ Base64 និងដោះស្រាយ Mixed Content) ---
  const getCleanUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    
    // បើជារូបភាព Base64 ឱ្យបង្ហាញផ្ទាល់តែម្តង
    if (typeof img === 'string' && img.startsWith('data:')) {
      return img;
    }
    
    // បើជាប់ localhost ដូរទៅ API_URL (សម្រាប់ទិន្នន័យចាស់)
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    
    // បើជា Path ខ្លី
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/${img}`;
    }
    
    return img;
  };

  // --- ២. ទាញទិន្នន័យពី API ---
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
    const interval = setInterval(fetchData, 15000); // ទាញរាល់ ១៥ វិនាទី
    return () => clearInterval(interval);
  }, []);

  // --- ៣. Filter Logic ---
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
                            (order.customerPhone && order.customerPhone.includes(term));
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  // --- ៤. Product Handlers ---
  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    const url = isEditMode 
      ? `${API_URL}/api/update/product/${editId}` 
      : `${API_URL}/api/upload`;

    const form = new FormData();
    Object.keys(formData).forEach(key => form.append(key, formData[key]));
    form.append('type', 'product');
    // បញ្ជូនរូបភាពជា Array ទៅកាន់ Backend
    files.forEach(file => form.append('images', file));

    try {
      const res = await fetch(url, { method: isEditMode ? 'PUT' : 'POST', body: form });
      if (res.ok) {
        toast.success(isEditMode ? "កែប្រែជោគជ័យ!" : "បង្កើតជោគជ័យ!");
        setIsModalOpen(false);
        setFiles([]); setPreviews([]);
        fetchData();
      }
    } catch (err) { toast.error("ប្រតិបត្តិការបរាជ័យ!"); }
  };

  // --- ៥. Banner Upload Handler (កែតម្រូវឱ្យត្រូវជាមួយ Backend) ---
  const handleBannerUpload = async (title, file) => {
    const formData = new FormData();
    formData.append('type', 'banner');
    formData.append('title', title);
    formData.append('images', file); // ត្រូវប្រើ 'images' ដូចក្នុង Backend

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        toast.success("បង្ហោះ Banner រួចរាល់!");
        fetchData();
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) { 
      toast.error("មិនអាចបង្ហោះ Banner បានទេ!"); 
      throw err; 
    }
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
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans italic">
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

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in duration-500">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={28}/>} color="blue" />
            <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={28}/>} color="amber" />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} color="purple" />
            <StatCard label="Total Income" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`} icon={<BarChart3 size={28}/>} color="emerald" />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Inventory</h3>
              <button 
                onClick={() => { setIsEditMode(false); setFormData({name:'', price:'', category:'phone', detail:'', stock:0}); setPreviews([]); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all"
              ><Plus size={18}/> Add Product</button>
            </div>
            <ProductTable 
                products={filteredProducts} 
                onEdit={(p) => { 
                    setFormData(p); 
                    setEditId(p.id); 
                    setIsEditMode(true); 
                    const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
                    setPreviews(imgs.map(img => getCleanUrl(img))); 
                    setIsModalOpen(true); 
                }} 
                onDelete={handleDelete} 
                onUpdateStock={async (id, newStock) => {
                    await fetch(`${API_URL}/api/update/product/${id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ update_type: 'stock_only', stock: newStock })
                    });
                    fetchData();
                }}
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <OrderTable 
            orders={filteredOrders} 
            onUpdateStatus={async (id, status) => {
                await fetch(`${API_URL}/api/orders/${id}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status })
                });
                fetchData();
                toast.success("ប្តូរស្ថានភាពជោគជ័យ!");
            }} 
            onDelete={(id) => handleDelete('order', id)} 
            onViewPayslip={(url) => setSelectedImg(getCleanUrl(url))} 
          />
        )}

        {activeTab === 'banners' && (
          <BannerSection banners={data.banners} onDelete={handleDelete} onUpload={handleBannerUpload} />
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
        <div className="fixed inset-0 bg-slate-900/90 z-[999] flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-h-[85vh] rounded-2xl shadow-2xl border-4 border-white/20 animate-in zoom-in-95" alt="Slip" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;