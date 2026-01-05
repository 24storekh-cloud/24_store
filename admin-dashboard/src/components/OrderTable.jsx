import React from 'react';
import { Trash2, Clock, CheckCircle, Image as ImageIcon } from 'lucide-react';
import API_URL from '../apiConfig'; // ១. Import API_URL

const OrderTable = ({ orders, onUpdateStatus, onDelete, onViewPayslip }) => {
  
  // ២. បង្កើត Function ជំនួយសម្រាប់លាង URL វិក្កយបត្រ
  const getCleanSlipUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/${img}`;
    }
    return img;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-100">
          <tr>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Qty</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Payslip</th>
            <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {orders.map(o => {
            const slipUrl = getCleanSlipUrl(o.payslip); // លាង URL មុនយកទៅប្រើ

            return (
              <tr key={o.orderId || o._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <p className="font-black text-slate-800">{o.customerName}</p>
                </td>
                
                <td className="p-6">
                  <p className="font-bold text-slate-600">{o.customerPhone}</p>
                </td>
                
                <td className="p-6 text-xs font-bold text-slate-500 max-w-[150px] truncate">
                  {o.productName}
                </td>

                <td className="p-6 text-center">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-800 font-black text-xs border border-slate-200">
                    {o.quantity || o.qty || 1} 
                  </span>
                </td>
                
                <td className="p-6 font-black text-emerald-600">
                  ${Number(o.total || 0).toLocaleString()}
                </td>
                
                <td className="p-6">
                  <button 
                    onClick={() => onUpdateStatus(o.orderId || o._id, o.status === 'Pending' ? 'Completed' : 'Pending')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                        o.status === 'Pending' ? 'bg-amber-50 text-amber-500' : 'bg-green-50 text-green-500'
                    }`}
                  >
                    {o.status === 'Pending' ? <Clock size={14}/> : <CheckCircle size={14}/>}
                    {o.status}
                  </button>
                </td>

                <td className="p-6 text-center">
                  {slipUrl ? (
                    <button 
                      onClick={() => onViewPayslip(slipUrl)} 
                      className="relative group inline-block active:scale-90 transition-all"
                    >
                      <img 
                        src={slipUrl} 
                        alt="Slip" 
                        className="w-12 h-16 object-cover rounded-lg border-2 border-slate-100 shadow-sm group-hover:border-blue-400 group-hover:shadow-md transition-all"
                        onError={(e) => { e.target.src = 'https://placehold.co/100x150?text=Error'; }}
                      />
                      <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 rounded-lg flex items-center justify-center text-white transition-all">
                        <ImageIcon size={14} />
                      </div>
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-300 font-bold uppercase italic">No Slip</span>
                  )}
                </td>

                <td className="p-6 text-right">
                  <button 
                    onClick={() => onDelete(o.orderId || o._id)} 
                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-90"
                  >
                    <Trash2 size={18}/>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;