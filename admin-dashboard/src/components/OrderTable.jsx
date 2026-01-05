import React from 'react';
import { Trash2, Clock, CheckCircle, Image as ImageIcon, Phone, User, MapPin } from 'lucide-react';
import API_URL from '../apiConfig';

const OrderTable = ({ orders, onUpdateStatus, onDelete, onViewPayslip }) => {
  
  // ១. Function ជំនួយសម្រាប់រៀបចំ URL រូបភាពវិក្កយបត្រ (Payslip)
  const getCleanSlipUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string' && (img.startsWith('http') || img.startsWith('data:'))) {
        if (img.includes('localhost:5000')) {
            return img.replace('http://localhost:5000', API_URL);
        }
        return img;
    }
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}/uploads/${img}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50/80 border-b border-slate-100">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer Info</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order Details</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
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
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <User size={12} />
                          </div>
                          <p className="font-black text-slate-800 uppercase text-xs tracking-tight">{o.customerName}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-slate-400" />
                          <p className="font-bold text-slate-500 text-[11px]">{o.phoneNumber || o.customerPhone}</p>
                        </div>
                        {o.location && (
                          <div className="flex items-center gap-2 opacity-60">
                            <MapPin size={10} className="text-slate-400" />
                            <p className="text-[10px] font-medium text-slate-500 truncate max-w-[120px]">{o.location}</p>
                          </div>
                        )}
                      </div>
                    </td>
                    
                    {/* Product Name */}
                    <td className="p-6">
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-700 max-w-[200px] line-clamp-1">
                          {o.productName || "Unknown Product"}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase italic">ID: {orderId}</p>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-50 text-slate-700 font-black text-xs border border-slate-100 shadow-sm">
                        {o.quantity || o.qty || 1} 
                      </span>
                    </td>
                    
                    {/* Total Price */}
                    <td className="p-6">
                      <p className="font-black text-blue-600 text-sm">
                        ${Number(o.total || 0).toLocaleString()}
                      </p>
                    </td>
                    
                    {/* Status Toggle */}
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => onUpdateStatus(orderId, o.status === 'Pending' ? 'Completed' : 'Pending')}
                        className={`mx-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 border-2 ${
                            o.status === 'Pending' 
                            ? 'bg-amber-50 border-amber-200 text-amber-600' 
                            : 'bg-emerald-50 border-emerald-200 text-emerald-600'
                        }`}
                      >
                        {o.status === 'Pending' ? <Clock size={12}/> : <CheckCircle size={12}/>}
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
                            className="w-10 h-14 object-cover rounded-lg border-2 border-white shadow-md ring-1 ring-slate-100 group-hover/slip:ring-blue-400 transition-all"
                            onError={(e) => { e.target.src = 'https://placehold.co/100x150?text=Error'; }}
                          />
                          <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover/slip:opacity-100 rounded-lg flex items-center justify-center text-white transition-all">
                            <ImageIcon size={14} />
                          </div>
                        </button>
                      ) : (
                        <span className="text-[8px] text-slate-300 font-black uppercase italic tracking-tighter">COD</span>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => onDelete(orderId)} 
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                      >
                        <Trash2 size={18}/>
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