import React from 'react';
import { Trash2, Edit, PlusCircle, MinusCircle } from 'lucide-react';
import API_URL from '../apiConfig'; // ១. កុំភ្លេច Import API_URL

const ProductTable = ({ products, onEdit, onDelete, onUpdateStock }) => {

  // ២. បង្កើត Function សម្រាប់លាង URL រូបភាព
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/100x100?text=No+Img';
    
    // បើជាប់ localhost ដូរទៅ API_URL
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    // បើជា Path ខ្លី
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/${img}`;
    }
    return img;
  };

  return (
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
          {products.map(p => {
            // ៣. ឆែកមើលថាតើ p.images ជា Array ឬជា String ទទេ
            const mainImage = Array.isArray(p.images) && p.images.length > 0 
              ? p.images[0] 
              : p.image; // បើគ្មាន images array ប្រើ field image ធម្មតា

            return (
              <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition-colors">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    {/* ៤. ប្រើ getImageUrl ដើម្បីទាញរូបភាពត្រឹមត្រូវ */}
                    <img 
                      src={getImageUrl(mainImage)} 
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100" 
                      alt={p.name} 
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                    />
                    <div>
                      <p className="font-black text-slate-800">{p.name}</p>
                    </div>
                  </div>
                </td>
                <td className="p-6"><span className="font-black text-slate-800">${Number(p.price).toLocaleString()}</span></td>
                <td className="p-6">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onUpdateStock(p.id || p._id, (p.stock || 0) - 1)} 
                      className="text-slate-300 hover:text-red-500 transition-colors"
                    >
                      <MinusCircle size={20}/>
                    </button>
                    <span className={`w-12 text-center font-black py-1 rounded-lg ${(p.stock || 0) < 5 ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-600'}`}>
                      {p.stock || 0}
                    </span>
                    <button 
                      onClick={() => onUpdateStock(p.id || p._id, (p.stock || 0) + 1)} 
                      className="text-slate-300 hover:text-green-500 transition-colors"
                    >
                      <PlusCircle size={20}/>
                    </button>
                  </div>
                </td>
                <td className="p-6"><span className="px-4 py-2 bg-slate-100 rounded-xl text-xs font-black text-slate-500 uppercase">{p.category}</span></td>
                <td className="p-6 text-right space-x-2">
                  <button onClick={() => onEdit(p)} className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all"><Edit size={18}/></button>
                  <button onClick={() => onDelete('product', p.id || p._id)} className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={18}/></button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProductTable;