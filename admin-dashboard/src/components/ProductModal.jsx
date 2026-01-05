import React from 'react';
import { X, Upload, Package } from 'lucide-react';
import API_URL from '../apiConfig';

const ProductModal = ({ 
  isOpen, isEditMode, formData, setFormData, 
  onClose, onSubmit, onFileChange, previews 
}) => {
  
  // ១. អនុគមន៍ជំនួយសម្រាប់សម្អាត URL រូបភាព
  const getCleanPreviewUrl = (src) => {
    if (!src) return '';
    // បើជា Blob (រូបភាពថ្មី) ឬ Base64
    if (typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:'))) return src;
    // បើជាឈ្មោះ File ធម្មតា ភ្ជាប់ទៅកាន់ Server uploads
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return `${baseUrl}/uploads/${src}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600 rounded-2xl text-white">
                <Package size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management v2.6 • Inventory Control</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-red-500"
          >
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-5 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Product Name</label>
            <input 
              required 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white" 
              placeholder="ឈ្មោះផលិតផល..." 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic tracking-widest">Selling Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                min="0"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white text-emerald-600" 
                placeholder="0.00" 
                value={formData.price || ''} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-red-400 uppercase ml-2 italic underline tracking-widest">Cost Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                min="0"
                className="w-full p-4 bg-red-50/30 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-red-500 transition-all border border-transparent focus:bg-white text-red-600" 
                placeholder="0.00" 
                value={formData.cost || ''} 
                onChange={e => setFormData({...formData, cost: e.target.value})} 
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold cursor-pointer border border-transparent focus:border-blue-500 transition-all" 
                value={formData.category || 'phone'} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="phone">Smartphones</option>
                <option value="accessory">Accessory</option>
                <option value="watch">Smart Watch</option>
                <option value="tablet">Tablets</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Stock Qty</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white" 
                placeholder="0" 
                value={formData.stock || 0} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Description</label>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white min-h-[100px] resize-none" 
              placeholder="ព័ត៌មានលម្អិតពីផលិតផល..." 
              value={formData.detail || ''} 
              onChange={e => setFormData({...formData, detail: e.target.value})}
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Product Images</label>
            <label className="block p-8 border-4 border-dashed border-slate-100 rounded-[2.5rem] hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer text-center group">
              <input type="file" multiple className="hidden" onChange={onFileChange} accept="image/*" />
              <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-600 transition-colors">ចុចដើម្បីជ្រើសរើសរូបភាព (អាចលើសពី ១)</p>
            </label>
          </div>

          {/* Previews */}
          {previews && previews.length > 0 && (
            <div className="space-y-2">
              <p className="text-[9px] font-black text-blue-500 uppercase ml-2">Selected Preview ({previews.length})</p>
              <div className="flex gap-3 overflow-x-auto py-3 px-1 scrollbar-hide">
                {previews.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0 animate-in fade-in zoom-in duration-300">
                    <img 
                      src={getCleanPreviewUrl(src)} 
                      className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-white ring-1 ring-slate-100" 
                      alt={`Preview ${i}`} 
                      onError={(e) => { e.target.src = 'https://placehold.co/100x100?text=Error'; }}
                    />
                    <div className="absolute -top-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-sm">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 sticky bottom-0 bg-white pb-2">
            <button 
              type="submit" 
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase italic"
            >
              {isEditMode ? 'Update Database' : 'Publish Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;