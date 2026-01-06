import React, { useEffect } from 'react';
import { X, Upload, Package, Info, DollarSign } from 'lucide-react';
import API_URL from '../apiConfig';

const ProductModal = ({ 
  isOpen, isEditMode, formData, setFormData, 
  onClose, onSubmit, onFileChange, previews 
}) => {
  
  // ១. អនុគមន៍ជំនួយសម្រាប់សម្អាត URL រូបភាព (Preview)
  const getCleanPreviewUrl = (src) => {
    if (!src) return '';
    // បើជា Blob (រូបភាពទើបជ្រើសរើស) ឬ Base64
    if (typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('data:'))) return src;
    
    // បើជារូបភាពមកពី Server
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanPath = typeof src === 'string' ? src.replace('uploads/', '') : src;
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  // ២. បិទការ Scroll របស់ Page ខាងក្រោមនៅពេល Modal បើក
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white my-auto">
        
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-200 ring-4 ring-blue-50">
                <Package size={22} strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none tracking-tight">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2 flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                Inventory Management v2.6
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-white border border-slate-100 rounded-2xl transition-all text-slate-400 hover:text-red-500 hover:shadow-lg active:scale-90"
          >
            <X size={24} strokeWidth={3} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          
          {/* Product Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest flex items-center gap-2">
               <Info size={12} /> Product Name
            </label>
            <input 
              required 
              className="w-full p-4.5 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all border-2 border-transparent focus:border-blue-500 focus:bg-white text-slate-700" 
              placeholder="បញ្ជូលឈ្មោះទំនិញ" 
              value={formData.name || ''} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          {/* Pricing Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-emerald-500 uppercase ml-2 italic tracking-widest flex items-center gap-2">
                <DollarSign size={12} /> Selling Price ($)
              </label>
              <input 
                required 
                type="number" 
                step="0.01"
                min="0"
                className="w-full p-4.5 bg-emerald-50/30 rounded-2xl outline-none font-black focus:ring-4 focus:ring-emerald-500/10 transition-all border-2 border-transparent focus:border-emerald-500 focus:bg-white text-emerald-600 text-lg" 
                placeholder="0.00" 
                value={formData.price || ''} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase ml-2 italic underline tracking-widest">
                Cost Price ($)
              </label>
              <input 
                required 
                type="number" 
                step="0.01"
                min="0"
                className="w-full p-4.5 bg-rose-50/30 rounded-2xl outline-none font-black focus:ring-4 focus:ring-rose-500/10 transition-all border-2 border-transparent focus:border-rose-500 focus:bg-white text-rose-600 text-lg" 
                placeholder="0.00" 
                value={formData.cost || ''} 
                onChange={e => setFormData({...formData, cost: e.target.value})} 
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Category</label>
              <div className="relative">
                <select 
                  className="w-full p-4.5 bg-slate-50 rounded-2xl outline-none font-bold cursor-pointer border-2 border-transparent focus:border-blue-500 transition-all appearance-none" 
                  value={formData.category || 'phone'} 
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option value="phone">Smartphones</option>
                  <option value="accessory">Accessory</option>
                  <option value="watch">Smart Watch</option>
                  <option value="tablet">Tablets</option>
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                   <Package size={16} />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Stock Qty</label>
              <input 
                required
                type="number" 
                min="0"
                className="w-full p-4.5 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all border-2 border-transparent focus:border-blue-500 focus:bg-white" 
                placeholder="0" 
                value={formData.stock || ''} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Description</label>
            <textarea 
              className="w-full p-5 bg-slate-50 rounded-[2rem] outline-none font-bold focus:ring-4 focus:ring-blue-500/10 transition-all border-2 border-transparent focus:border-blue-500 focus:bg-white min-h-[120px] resize-none text-slate-600" 
              placeholder="ព័ត៌មានលម្អិតពីផលិតផល..." 
              value={formData.detail || ''} 
              onChange={e => setFormData({...formData, detail: e.target.value})}
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Product Images</label>
            <label className="block p-10 border-4 border-dashed border-slate-100 rounded-[3rem] hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer text-center group relative overflow-hidden bg-slate-50/50">
              <input type="file" multiple className="hidden" onChange={onFileChange} accept="image/*" />
              <div className="relative z-10 pointer-events-none">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform duration-500">
                   <Upload className="text-blue-500" size={28} strokeWidth={2.5} />
                </div>
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Drop photos or Click to Upload</p>
                <p className="text-[9px] font-bold text-slate-300 uppercase mt-1">Supports: JPG, PNG, WEBP (Multi-select)</p>
              </div>
            </label>
          </div>

          {/* Previews */}
          {previews && previews.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500 bg-slate-50/50 p-6 rounded-[2.5rem] border border-slate-100">
              <p className="text-[10px] font-black text-blue-500 uppercase ml-2 flex items-center gap-2 tracking-widest">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                Gallery Preview ({previews.length})
              </p>
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide px-2">
                {previews.map((src, i) => (
                  <div key={i} className="relative flex-shrink-0 group/img">
                    <img 
                      src={getCleanPreviewUrl(src)} 
                      className="w-28 h-28 rounded-[2rem] object-cover shadow-xl border-4 border-white ring-1 ring-slate-100 group-hover/img:scale-105 transition-all duration-300" 
                      alt={`Preview ${i}`} 
                      onError={(e) => { e.target.src = 'https://placehold.co/150x150?text=Error'; }}
                    />
                    <div className="absolute -top-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black border-4 border-white shadow-lg">
                      {i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-6 sticky bottom-0 bg-white/80 backdrop-blur-md pb-4 z-20 border-t border-slate-50">
            <button 
              type="submit" 
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-200 active:scale-[0.97] transition-all flex items-center justify-center gap-4 uppercase italic tracking-widest"
            >
              {isEditMode ? 'Update Database' : 'Publish Product'}
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                 <Package size={14} />
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;