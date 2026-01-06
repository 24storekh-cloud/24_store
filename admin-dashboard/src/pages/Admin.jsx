import React, { useState, useEffect } from 'react';
import API_URL from '../apiConfig';
import { Package, ClipboardList, Trash2, Edit, Save, X, CheckCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // សម្រាប់កែប្រែស្តុក
  const [editingId, setEditingId] = useState(null);
  const [tempStock, setTempStock] = useState(0);

  const fetchData = async () => {
    try {
      const res = await fetch(`${API_URL}/api/data`);
      const data = await res.json();
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setLoading(false);
    } catch (err) {
      toast.error("មិនអាចទាញទិន្នន័យបានទេ!");
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ១. មុខងារ Update ស្ថានភាព Order
  const updateOrderStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        toast.success("បច្ចុប្បន្នភាពស្ថានភាពជោគជ័យ!");
        fetchData();
      }
    } catch (err) { toast.error("Error updating status"); }
  };

  // ២. មុខងារកែប្រែស្តុកផលិតផល
  const handleUpdateStock = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/update/product/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stock: tempStock })
      });
      if (res.ok) {
        toast.success("ធ្វើបច្ចុប្បន្នភាពស្តុកជោគជ័យ!");
        setEditingId(null);
        fetchData();
      }
    } catch (err) { toast.error("Error updating stock"); }
  };

  // ៣. មុខងារលុបទិន្នន័យ (Product ឬ Order)
  const handleDelete = async (type, id) => {
    if (!window.confirm("តើអ្នកពិតជាចង់លុបមែនទេ?")) return;
    try {
      const res = await fetch(`${API_URL}/api/delete/${type}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success("លុបបានជោគជ័យ!");
        fetchData();
      }
    } catch (err) { toast.error("Error deleting item"); }
  };

  if (loading) return <div className="p-20 text-center font-bold">កំពុងផ្ទុក...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 min-h-screen bg-slate-50">
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-3xl font-black text-slate-800 italic uppercase">Admin Dashboard</h1>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'products' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}
        >
          <Package size={20} /> គ្រប់គ្រងស្តុក
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-blue-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}
        >
          <ClipboardList size={20} /> មើលការកម្ម៉ង់ ({orders.length})
        </button>
      </div>

      {/* Product List Content */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-5 font-bold text-slate-600 uppercase text-xs">ទំនិញ</th>
                <th className="p-5 font-bold text-slate-600 uppercase text-xs">តម្លៃ</th>
                <th className="p-5 font-bold text-slate-600 uppercase text-xs">ស្តុកបច្ចុប្បន្ន</th>
                <th className="p-5 font-bold text-slate-600 uppercase text-xs text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img src={Array.isArray(p.images) ? p.images[0] : p.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                      <span className="font-bold text-slate-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="p-5 font-bold text-blue-600">${p.price}</td>
                  <td className="p-5">
                    {editingId === p.id ? (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-20 p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" 
                          value={tempStock}
                          onChange={(e) => setTempStock(e.target.value)}
                        />
                        <button onClick={() => handleUpdateStock(p.id)} className="p-2 bg-green-500 text-white rounded-lg"><Save size={16}/></button>
                        <button onClick={() => setEditingId(null)} className="p-2 bg-slate-200 text-slate-500 rounded-lg"><X size={16}/></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full font-bold text-xs ${p.stock < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                          {p.stock} ក្នុងស្តុក
                        </span>
                        <button onClick={() => { setEditingId(p.id); setTempStock(p.stock); }} className="text-slate-400 hover:text-blue-500"><Edit size={16}/></button>
                      </div>
                    )}
                  </td>
                  <td className="p-5 text-center">
                    <button onClick={() => handleDelete('product', p.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"><Trash2 size={20}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Orders Content */}
      {activeTab === 'orders' && (
        <div className="grid gap-6">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6">
              <div className="flex-grow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-800 mb-1 tracking-tight">#ORDER-{order.id.slice(-6)}</h3>
                    <p className="text-slate-400 text-sm">{new Date(order.date).toLocaleString()}</p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-full font-black text-[10px] uppercase tracking-widest ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600 animate-pulse'
                  }`}>
                    {order.status}
                  </span>
                </div>
                
                <div className="space-y-2 mb-6">
                  <p className="text-slate-600"><strong>អតិថិជន:</strong> {order.customerName} ({order.phone})</p>
                  <p className="text-slate-600"><strong>អាសយដ្ឋាន:</strong> {order.address}</p>
                  <p className="text-blue-600 font-bold text-xl uppercase mt-4">សរុប: ${order.totalAmount}</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => updateOrderStatus(order.id, 'Completed')}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition"
                  >
                    <CheckCircle size={18}/> បញ្ចប់ការលក់
                  </button>
                  <button 
                    onClick={() => handleDelete('order', order.id)}
                    className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>

              {/* រូបភាពបង់ប្រាក់ */}
              <div className="w-full md:w-48 h-64 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group">
                <img src={order.payslip} className="w-full h-full object-cover" alt="Payslip" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer">
                  <a href={order.payslip} target="_blank" rel="noreferrer" className="text-white text-xs font-bold underline">មើលច្បាស់</a>
                </div>
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-center py-20 text-slate-400 font-bold">មិនទាន់មានការកម្ម៉ង់នៅឡើយ...</div>}
        </div>
      )}
    </div>
  );
};

export default Admin;