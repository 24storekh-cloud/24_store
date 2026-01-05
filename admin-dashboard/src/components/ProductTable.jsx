import React from 'react';
import { Trash2, Edit, PlusCircle, MinusCircle } from 'lucide-react';
import API_URL from '../apiConfig'; 

const ProductTable = ({ products, onEdit, onDelete, onUpdateStock }) => {

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/100x100?text=No+Img';
    
    if (typeof img === 'string' && img.startsWith('data:')) return img;

    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }

    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }

    if (typeof img === 'string') {
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const cleanImgPath = img.startsWith('/') ? img.slice(1) : img;
      // ប្រសិនបើ Server ទុកក្នុង folder uploads
      return img.startsWith('uploads') ? `${baseUrl}/${cleanImgPath}` : `${baseUrl}/uploads/${cleanImgPath}`;
    }

    return img;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
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
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center font-bold text-slate-400 uppercase italic text-xs">
                  មិនមានទិន្នន័យទំនិញឡើយ...
                </td>
              </tr>
            ) : (
              products.map(p => {
                const mainImage = Array.isArray(p.images) && p.images.length > 0 
                  ? p.images[0] 
                  : p.image;

                return (
                  <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={getImageUrl(mainImage)} 
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300" 
                          alt={p.name} 
                          onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                        />
                        <div>
                          <p className="font-black text-slate-800 line-clamp-1">{p.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-black text-emerald-600">
                        ${Number(p.price).toLocaleString()}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => onUpdateStock(p.id, (parseInt(p.stock) || 0) - 1)} 
                          className="text-slate-300 hover:text-red-500 transition-colors active:scale-90"
                          disabled={(parseInt(p.stock) || 0) <= 0}
                        >
                          <MinusCircle size={20}/>
                        </button>
                        <span className={`w-12 text-center font-black py-1.5 rounded-xl text-xs ${
                          (parseInt(p.stock) || 0) < 5 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {p.stock || 0}
                        </span>
                        <button 
                          onClick={() => onUpdateStock(p.id, (parseInt(p.stock) || 0) + 1)} 
                          className="text-slate-300 hover:text-green-500 transition-colors active:scale-90"
                        >
                          <PlusCircle size={20}/>
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-1">
                      <button 
                        onClick={() => onEdit(p)} 
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                      >
                        <Edit size={18}/>
                      </button>
                      <button 
                        onClick={() => onDelete('product', p.id)} 
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;