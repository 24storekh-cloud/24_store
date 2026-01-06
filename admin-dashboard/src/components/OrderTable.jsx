import React from 'react';
import { Trash2, Clock, CheckCircle, Image as ImageIcon, Phone, User, MapPin, Calendar, Truck } from 'lucide-react';
import API_URL from '../apiConfig';

const OrderTable = ({ orders, onUpdateStatus, onDelete, onViewPayslip }) => {
  
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
        <table className="w-full text-left border-collapse min-w-[900px]">
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
              orders.map((o, index) => { // ថែម index ដើម្បីបង្ហាញលេខរៀង
                const slipUrl = getCleanSlipUrl(o.payslip || o.imagePay);
                const orderId = o.orderId || o.id || o._id;

                return (
                  <tr key={orderId} className="hover:bg-slate-50/50 transition-colors group">
                    {/* Customer Info */}
                    <td className="p-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          {/* បន្ថែមលេខរៀងកុម្ម៉ង់ */}
                          <span className="text-[10px] font-black text-blue-600 bg-blue-50 w-5 h-5 flex items-center justify-center rounded-full border border-blue-100 italic">
                            {index + 1}
                          </span>
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                            <User size={14} />
                          </div>
                          <p className="font-black text-slate-800 uppercase text-xs tracking-tight italic">{o.customerName || 'No Name'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone size={12} className="text-slate-400" />
                          <p className="font-bold text-slate-500 text-[11px] tracking-widest">{o.phoneNumber || o.customerPhone || 'N/A'}</p>
                        </div>
                        <div className="flex items-start gap-2 opacity-80 max-w-[180px]">
                          <MapPin size={12} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-[10px] font-bold text-slate-400 leading-tight">
                            {o.address || o.customerAddress || 'Phnom Penh'}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Order Details & Shipping */}
                    <td className="p-6">
                      <div className="space-y-1.5">
                        <p className="text-xs font-black text-slate-700 max-w-[200px] line-clamp-1 uppercase">
                          {o.productName || "Product Order"}
                        </p>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase italic">
                             <Calendar size={10} />
                             {o.date ? new Date(o.date).toLocaleDateString() : 'Recent'}
                          </div>
                          {/* បន្ថែមព័ត៌មានដឹកជញ្ជូន */}
                          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-blue-50/50 text-blue-600 rounded-md w-fit text-[9px] font-black uppercase italic border border-blue-100/50">
                             <Truck size={10} /> {o.location || 'តំបន់មិនច្បាស់លាស់'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Quantity */}
                    <td className="p-6 text-center">
                      <span className="inline-flex items-center justify-center w-9 h-9 rounded-2xl bg-slate-100 text-slate-800 font-black text-xs border border-white shadow-inner">
                        {o.quantity || o.qty || 1}
                      </span>
                    </td>
                    
                    {/* Total Price */}
                    <td className="p-6">
                      <p className="font-black text-blue-600 text-base italic tracking-tighter">
                        ${Number(o.total || o.totalAmount || 0).toLocaleString()}
                      </p>
                    </td>
                    
                    {/* Status Toggle */}
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => onUpdateStatus(orderId, o.status === 'Pending' ? 'Completed' : 'Pending')}
                        className={`mx-auto flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 shadow-sm ${
                            o.status === 'Pending' 
                            ? 'bg-amber-50 border-amber-100 text-amber-500 animate-pulse' 
                            : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                        }`}
                      >
                        {o.status === 'Pending' ? <Clock size={12}/> : <CheckCircle size={12}/>}
                        {o.status || 'Pending'}
                      </button>
                    </td>

                    {/* Payslip Image */}
                    <td className="p-6 text-center">
                      {slipUrl ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <button 
                            onClick={() => onViewPayslip(slipUrl)} 
                            className="relative group/slip inline-block active:scale-90 transition-all"
                          >
                            <img 
                              src={slipUrl} 
                              alt="Slip" 
                              className="w-12 h-16 object-cover rounded-xl border-4 border-white shadow-lg ring-1 ring-slate-100 group-hover/slip:ring-blue-400 transition-all duration-300"
                              onError={(e) => { e.target.src = 'https://placehold.co/100x150?text=Error'; }}
                            />
                            <div className="absolute inset-0 bg-blue-600/40 opacity-0 group-hover/slip:opacity-100 rounded-xl flex items-center justify-center text-white transition-all backdrop-blur-[2px]">
                              <ImageIcon size={18} />
                            </div>
                          </button>
                          {/* បន្ថែមសម្គាល់ការបង់តាមធនាគារ */}
                          <span className="text-[8px] font-black text-blue-400 uppercase tracking-widest italic">Bank Paid</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <div className="px-3 py-1 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                             <span className="text-[9px] text-slate-400 font-black uppercase italic tracking-tighter">COD</span>
                          </div>
                          <span className="text-[8px] text-slate-300 font-bold uppercase tracking-tighter">Cash on Delivery</span>
                        </div>
                      )}
                    </td>

                    {/* Delete Action */}
                    <td className="p-6 text-right">
                      <button 
                        onClick={() => onDelete(orderId)} 
                        className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                      >
                        <Trash2 size={20}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="p-32 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center border border-slate-100 shadow-inner">
                       <CheckCircle size={40} className="text-slate-200" />
                    </div>
                    <p className="font-black text-slate-300 uppercase italic tracking-[0.3em] text-sm">Empty Orders</p>
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