import React from 'react';
import { Trash2, Clock, CheckCircle, Image as ImageIcon, Phone, User } from 'lucide-react';
import API_URL from '../apiConfig';

const OrderTable = ({ orders, onUpdateStatus, onDelete, onViewPayslip }) => {
  
  // ១. Function ជំនួយសម្រាប់រៀបចំ URL រូបភាពវិក្កយបត្រ (Payslip)
  const getCleanSlipUrl = (img) => {
    if (!img) return null;
    
    // បើជា URL ពេញស្រាប់ (ឧទាហរណ៍៖ ទាញពី Cloud ឬ Base64)
    if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))) {
        // បើវាជាប់ localhost ចាស់ ត្រូវប្តូរមក API_URL ថ្មី
        if (img.includes('localhost:5000')) {
            return img.replace('http://localhost:5000', API_URL);
        }
        return img;
    }
    
    // បើជាឈ្មោះ File ធម្មតា ត្រូវភ្ជាប់ជាមួយ /uploads/
    return `${API_URL}/uploads/${img}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Info</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product Details</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payslip</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.length > 0 ? (
              orders.map((o) => {
                const slipUrl = getCleanSlipUrl(o.payslip);
                const orderId = o.orderId || o.id || o._id;

                return (
                  <tr key={orderId} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Customer Info */}
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <User size={14} className="text-blue-500" />
                          <p className="font-black text-slate-800 italic uppercase text-sm">{o.customerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-slate-400" />
                          <p className="font-bold text-slate-500 text-xs">{o.phoneNumber || o.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Product Name */}
                    <td className="p-6">
                      <p className="text-xs font-bold text-slate-600 max-w-[180px] truncate bg-slate-100 px-3 py-1 rounded-lg inline-block">
                        {o.productName || "Unknown Product"}
                      </p>
                    </td>

                    {/* Quantity */}
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-white text-slate-800 font-black text-xs border-2 border-slate-100 shadow-sm">
                        {o.quantity || o.qty || 1} 
                      </span>
                    </td>
                    
                    {/* Total Price */}
                    <td className="p-6">
                      <p className="font-black text-emerald-600 text-base">
                        ${Number(o.total || 0).toLocaleString()}
                      </p>
                    </td>
                    
                    {/* Status Toggle */}
                    <td className="p-6">
                      <button 
                        onClick={() => onUpdateStatus(orderId, o.status === 'Pending' ? 'Completed' : 'Pending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm hover:shadow-md active:scale-95 ${
                            o.status === 'Pending' 
                            ? 'bg-amber-500 text-white shadow-amber-100' 
                            : 'bg-emerald-500 text-white shadow-emerald-100'
                        }`}
                      >
                        {o.status === 'Pending' ? <Clock size={14}/> : <CheckCircle size={14}/>}
                        {o.status}
                      </button>
                    </td>

                    {/* Payslip Image */}
                    <td className="p-6 text-center">
                      {slipUrl ? (
                        <button 
                          onClick={() => onViewPayslip(slipUrl)} 
                          className="relative group/slip inline-block active:scale-90 transition-all"
                        >
                          <img 
                            src={slipUrl} 
                            alt="Slip" 
                            className="w-12 h-16 object-cover rounded-xl border-4 border-white shadow-lg ring-1 ring-slate-100 group-hover/slip:ring-blue-400 transition-all"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x150?text=Error'; }}
                          />
                          <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover/slip:opacity-100 rounded-xl flex items-center justify-center text-white transition-all">
                            <ImageIcon size={16} />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-300 font-black uppercase italic tracking-tighter bg-slate-50 px-2 py-1 rounded-md">No Payslip</span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => onDelete(orderId)} 
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <CheckCircle size={48} className="text-slate-400" />
                    <p className="font-black text-slate-500 uppercase italic tracking-widest">No orders found</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrderTable;