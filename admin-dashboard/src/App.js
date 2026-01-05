import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, X, 
  FileDown, BarChart3, Loader2
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
  const [isLoading, setIsLoading] = useState(true);
  
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

  // --- ១. មុខងារជំនួយសម្រាប់ URL រូបភាព (គាំទ្រ Base64) ---
  const getCleanUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && img.startsWith('data:')) return img;
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000); // ទាញរាល់ ១៥ វិនាទី
    return () => clearInterval(interval);
  }, []);

  // --- ៣. Filter Logic ---
  const filteredProducts = useMemo(() => {
    return data.products.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === 'all' || p.category === selectedCategory)
    );
  }, [data.products, searchTerm, selectedCategory]);

  const filteredOrders = useMemo(() => {
    return data.orders.filter(o => {
      const term = orderSearch.toLowerCase();
      const matchesSearch = o.customerName.toLowerCase().includes(term) || (o.customerPhone?.includes(term));
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  // --- ៤. Handlers ---
  const handleProductSubmit = async (e) => {
    if (e) e.preventDefault();
    const url = isEditMode ? `${API_URL}/api/update/product/${editId}` : `${API_URL}/api/upload`;

    const form = new FormData();
    Object.keys(formData).forEach(key => form.append(key, formData[key]));
    form.append('type', 'product');
    files.forEach(file => form.append('images', file));

    try {
      const res = await fetch(url, { method: isEditMode ? 'PUT' : 'POST', body: form });
      if (res.ok) {
        toast.success(isEditMode ? "Updated!" : "Created!");
        setIsModalOpen(false);
        // សម្អាត Previews ដើម្បីសន្សំ Memory
        previews.forEach(p => { if(p.startsWith('blob:')) URL.revokeObjectURL(p); });
        setFiles([]); setPreviews([]);
        fetchData();
      }
    } catch (err) { toast.error("Error saving product"); }
  };

  const handleBannerUpload = async (title, file) => {
    const form = new FormData();
    form.append('type', 'banner');
    form.append('title', title);
    form.append('images', file); // ប្រើ 'images' ឱ្យត្រូវជាមួយ Backend

    try {
      const res = await fetch(`${API_URL}/api/upload`, { method: 'POST', body: form });
      if (res.ok) {
        toast.success("Banner Added!");
        fetchData();
      } else { throw new Error(); }
    } catch (err) { 
      toast.error("Upload Failed!"); 
      throw err; 
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(`Delete this ${type}?`)) return;
    try {
      const res = await fetch(`${API_URL}/api/delete/${type}/${id}`, { method: 'DELETE' });
      if(res.ok) {
        fetchData();
        toast.success("Deleted!");
      }
    } catch (err) { toast.error("Delete failed!"); }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans italic">
      <Toaster position="top-right" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} icons={{ LayoutDashboard, Package, ShoppingCart, ImageIcon, BarChart3 }} />

      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-10 flex justify-between items-center">
           <div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic">Admin Panel</h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">Live: {new Date().toLocaleTimeString()}</p>
           </div>
           <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase">System Online</span>
           </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={24}/>} color="blue" />
            <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={24}/>} color="amber" />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={24}/>} color="purple" />
            <StatCard label="Revenue" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total || 0), 0).toLocaleString()}`} icon={<BarChart3 size={24}/>} color="emerald" />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Inventory</h3>
              <button onClick={() => { setIsEditMode(false); setFormData({name:'', price:'', category:'phone', detail:'', stock:0}); setPreviews([]); setIsModalOpen(true); }}
                className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg hover:bg-blue-700 transition-all">
                <Plus size={18}/> Add Product
              </button>
            </div>
            <ProductTable products={filteredProducts} onEdit={(p) => { 
                setFormData(p); setEditId(p.id); setIsEditMode(true); 
                const imgs = Array.isArray(p.images) ? p.images : (p.image ? [p.image] : []);
                setPreviews(imgs.map(img => getCleanUrl(img))); 
                setIsModalOpen(true); 
              }} onDelete={handleDelete} 
            />
          </div>
        )}

        {activeTab === 'orders' && (
          <OrderTable 
            orders={filteredOrders} 
            onUpdateStatus={async (id, status) => {
              const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
              });
              if(res.ok) { fetchData(); toast.success("Status Updated"); }
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

      {/* Lightbox */}
      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/90 z-[999] flex items-center justify-center p-6" onClick={() => setSelectedImg(null)}>
          <img src={selectedImg} className="max-h-[85vh] rounded-2xl shadow-2xl" alt="Preview" />
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;