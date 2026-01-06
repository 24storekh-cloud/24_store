import React from 'react';
import { Trash2, Edit, PlusCircle, MinusCircle } from 'lucide-react';
import API_URL from '../apiConfig'; 

const ProductTable = ({ products, onEdit, onDelete, onUpdateStock }) => {

  // មុខងារចម្រោះ URL រូបភាពឱ្យត្រឹមត្រូវបំផុត
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/100x100?text=No+Img';
    
    // បើជា Base64 (data:image...) ឱ្យវាកាន់យកភ្លាម
    if (typeof img === 'string' && img.startsWith('data:')) return img;

    // សម្អាត URL ករណីមាន localhost ច្របូកច្របល់
    if (typeof img === 'string' && img.includes('localhost:5000')) {
       const cleanPath = img.split('/uploads/').pop();
       return `${API_URL}/uploads/${cleanPath}`;
    }

    // បើជា URL ពេញលេញស្រាប់
    if (typeof img === 'string' && (img.startsWith('http://') || img.startsWith('https://'))) {
      return img;
    }

    // បើជាឈ្មោះហ្វាយធម្មតា (ឧទាហរណ៍៖ image123.jpg)
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanImgPath = typeof img === 'string' ? img.replace(/^\//, '') : '';
    
    return cleanImgPath.startsWith('uploads') 
      ? `${baseUrl}/${cleanImgPath}` 
      : `${baseUrl}/uploads/${cleanImgPath}`;
  };

  return (
    <div className="bg-white rounded-[2.5rem] shadow-xl border border-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Product</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Price</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stock</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</th>
              <th className="p-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-20 text-center font-bold text-slate-300 uppercase italic text-xs tracking-widest">
                  មិនមានទិន្នន័យទំនិញឡើយ...
                </td>
              </tr>
            ) : (
              products.map(p => {
                // ឆែកមើល images array ឬ image string
                const mainImage = Array.isArray(p.images) && p.images.length > 0 
                  ? p.images[0] 
                  : (p.image || null);

                const currentStock = parseInt(p.stock) || 0;

                return (
                  <tr key={p.id || p._id} className="hover:bg-slate-50/50 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl overflow-hidden shadow-sm border border-slate-100 bg-slate-50">
                          <img 
                            src={getImageUrl(mainImage)} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                            alt={p.name} 
                            onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                          />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 line-clamp-1 italic uppercase text-sm">{p.name}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">ID: {p.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-black text-blue-600 text-lg">
                        ${Number(p.price).toFixed(2)}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center justify-center gap-3">
                        <button 
                          onClick={() => onUpdateStock(p.id, currentStock - 1)} 
                          className="text-slate-300 hover:text-red-500 transition-colors active:scale-90 disabled:opacity-30"
                          disabled={currentStock <= 0}
                        >
                          <MinusCircle size={22}/>
                        </button>
                        <span className={`w-14 text-center font-black py-2 rounded-xl text-xs shadow-inner ${
                          currentStock < 5 ? 'bg-red-50 text-red-500 animate-pulse' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {currentStock}
                        </span>
                        <button 
                          onClick={() => onUpdateStock(p.id, currentStock + 1)} 
                          className="text-slate-300 hover:text-green-500 transition-colors active:scale-90"
                        >
                          <PlusCircle size={22}/>
                        </button>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">
                        {p.category}
                      </span>
                    </td>
                    <td className="p-6 text-right space-x-1">
                      <button 
                        onClick={() => onEdit(p)} 
                        className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all active:scale-90"
                        title="Edit Product"
                      >
                        <Edit size={20}/>
                      </button>
                      <button 
                        onClick={() => onDelete('product', p.id)} 
                        className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90"
                        title="Delete Product"
                      >
                        <Trash2 size={20}/>
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