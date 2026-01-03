import React, { useState, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, Package, ShoppingCart, 
  Image as ImageIcon, Plus, Search, Filter, X, 
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

  // --- ១. ទាញទិន្នន័យពី API (ប្រើ API_URL) ---
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
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

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
                            order.customerPhone.includes(term);
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data.orders, orderSearch, statusFilter]);

  const exportToExcel = () => {
    if (filteredOrders.length === 0) return toast.error("គ្មានទិន្នន័យសម្រាប់ Export!");
    const headers = ["Order ID,Customer,Phone,Product,Qty,Total,Status\n"];
    const rows = filteredOrders.map(o => 
      `${o.orderId},${o.customerName},${o.customerPhone},${o.productName},${o.quantity || o.qty || 1},${o.total},${o.status}`
    ).join("\n");
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Orders_Report_${new Date().toLocaleDateString()}.csv`;
    link.click();
    toast.success("ទាញយករបាយការណ៍រួចរាល់!");
  };

  // --- ៥. Handlers (ប្រើ API_URL) ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    // ប្តូរ URL តាមសភាពការណ៍
    const url = isEditMode 
      ? `${API_URL}/api/update/product/${editId}` 
      : `${API_URL}/api/upload`;

    const form = new FormData();
    Object.keys(formData).forEach(key => form.append(key, formData[key]));
    form.append('type', 'product');
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
      await fetch(`${API_URL}/api/delete/${type}/${id}`, { method: 'DELETE' });
      fetchData();
      toast.success("លុបរួចរាល់!");
    }
  };

  return (
    <div className="flex bg-[#F8FAFC] min-h-screen font-sans italic">
      <Toaster position="top-right" />
      
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} icons={{ LayoutDashboard, Package, ShoppingCart, ImageIcon , BarChart3}} />

      <main className="flex-1 p-10 overflow-y-auto">
        <header className="mb-10">
           <h2 className="text-3xl font-black text-slate-800 uppercase italic">Admin Panel</h2>
           <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Management v2.5</p>
        </header>

        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 animate-in fade-in zoom-in-95 duration-500">
            <StatCard label="Total Products" count={data.products.length} icon={<Package size={28}/>} color="blue" />
            <StatCard label="Pending Orders" count={data.orders.filter(o => o.status === 'Pending').length} icon={<ShoppingCart size={28}/>} color="amber" />
            <StatCard label="Active Banners" count={data.banners.length} icon={<ImageIcon size={28}/>} color="purple" />
            <StatCard label="Total Income" count={`$${data.orders.filter(o => o.status === 'Completed').reduce((sum, o) => sum + Number(o.total), 0).toLocaleString()}`} icon={<BarChart3 size={28}/>} color="emerald" />
          </div>
        )}

        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Inventory</h3>
              <div className="flex gap-3">
                <input 
                  type="text" placeholder="ស្វែងរកទំនិញ..." 
                  className="pl-6 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold shadow-sm focus:ring-2 focus:ring-blue-500 transition-all"
                  value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  onClick={() => { setIsEditMode(false); setFormData({name:'', price:'', category:'phone', detail:'', stock:0}); setPreviews([]); setIsModalOpen(true); }}
                  className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black flex items-center gap-2 shadow-lg"
                ><Plus size={18}/> Add Product</button>
              </div>
            </div>
            <ProductTable products={filteredProducts} onEdit={(p) => { setFormData(p); setEditId(p.id); setIsEditMode(true); setPreviews(p.images); setIsModalOpen(true); }} onDelete={handleDelete} />
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
              <h3 className="text-2xl font-black text-slate-800 uppercase italic">Customer Orders</h3>
              <div className="flex flex-wrap gap-3 w-full md:w-auto">
                <button onClick={exportToExcel} className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-emerald-700 transition-all">
                  <FileDown size={18}/> Export Excel
                </button>
                <select 
                  className="px-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-xs shadow-sm"
                  value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">ស្ថានភាពទាំងអស់</option>
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
            <OrderTable orders={filteredOrders} onUpdateStatus={handleUpdateOrderStatus} onDelete={(id) => handleDelete('order', id)} onViewPayslip={setSelectedImg} />
          </div>
        )}

        {activeTab === 'banners' && (
          <BannerSection banners={data.banners} onDelete={handleDelete} onUpload={async (t, f) => { /* logic upload */ }} />
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

      {selectedImg && (
        <div className="fixed inset-0 bg-slate-900/95 z-[999] flex items-center justify-center p-6 backdrop-blur-md transition-all" onClick={() => setSelectedImg(null)}>
          <div className="relative max-w-2xl w-full flex flex-col items-center">
            <button className="absolute -top-12 right-0 text-white hover:text-red-500 transition-colors">
              <X size={32} />
            </button>
            <img src={selectedImg} className="max-h-[85vh] w-auto rounded-3xl shadow-2xl border-4 border-white/10 animate-in zoom-in-95" alt="Slip" />
            <p className="mt-4 text-white/50 font-bold uppercase tracking-widest text-[10px]">Click anywhere to close</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;