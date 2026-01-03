import React from 'react';
import { Trash2, Edit, PlusCircle, MinusCircle } from 'lucide-react';

const ProductTable = ({ products, onEdit, onDelete, onUpdateStock }) => (
  <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4">
    <table className="w-full text-left">
      <thead className="bg-slate-50">
        <tr>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Stock</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
          <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {products.map(p => (
          <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
            <td className="p-6">
              <div className="flex items-center gap-4">
                <img src={p.images[0]} className="w-14 h-14 rounded-2xl object-cover shadow-sm" alt="" />
                <div>
                  <p className="font-black text-slate-800">{p.name}</p>
                </div>
              </div>
            </td>
            <td className="p-6"><span className="font-black text-slate-800">${p.price}</span></td>
            <td className="p-6">
              <div className="flex items-center gap-3">
                <button onClick={() => onUpdateStock(p.id, p.stock - 1)} className="text-slate-300 hover:text-red-500 transition-colors"><MinusCircle size={20}/></button>
                <span className={`w-12 text-center font-black py-1 rounded-lg ${p.stock < 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>{p.stock}</span>
                <button onClick={() => onUpdateStock(p.id, p.stock + 1)} className="text-slate-300 hover:text-green-500 transition-colors"><PlusCircle size={20}/></button>
              </div>
            </td>
            <td className="p-6"><span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-500 uppercase">{p.category}</span></td>
            <td className="p-6 text-right space-x-2">
              <button onClick={() => onEdit(p)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18}/></button>
              <button onClick={() => onDelete('product', p.id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProductTable;