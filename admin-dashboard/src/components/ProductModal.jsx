import React from 'react';
import { X, Upload, DollarSign, Tag, layers } from 'lucide-react';

const ProductModal = ({ 
  isOpen, isEditMode, formData, setFormData, 
  onClose, onSubmit, onFileChange, previews 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800 uppercase italic">
              {isEditMode ? 'Edit Product' : 'Add New Product'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">រៀបចំទិន្នន័យផលិតផល និងតម្លៃដើម</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-slate-400 hover:text-red-500">
            <X size={24}/>
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Product Name</label>
            <input 
              required 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white" 
              placeholder="ឈ្មោះផលិតផល..." 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
            />
          </div>

          {/* Pricing Section (Price & Cost) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 italic">Selling Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white text-emerald-600" 
                placeholder="តម្លៃលក់ចេញ" 
                value={formData.price} 
                onChange={e => setFormData({...formData, price: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-red-400 uppercase ml-2 italic underline">Cost Price ($)</label>
              <input 
                required 
                type="number" 
                step="0.01"
                className="w-full p-4 bg-red-50/30 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-red-500 transition-all border border-transparent focus:bg-white text-red-600" 
                placeholder="តម្លៃដើម" 
                value={formData.cost} 
                onChange={e => setFormData({...formData, cost: e.target.value})} 
              />
            </div>
          </div>

          {/* Category & Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Category</label>
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold cursor-pointer" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})}
              >
                <option value="phone">Smartphones</option>
                <option value="accessory">Accessory</option>
                <option value="watch">Smart Watch</option>
                <option value="tablet">Tablets</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Stock Qty</label>
              <input 
                type="number" 
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white" 
                placeholder="ចំនួនក្នុងស្តុក" 
                value={formData.stock} 
                onChange={e => setFormData({...formData, stock: e.target.value})} 
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Details / Description</label>
            <textarea 
              className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white" 
              placeholder="ព័ត៌មានលម្អិតពីផលិតផល..." 
              rows="3" 
              value={formData.detail} 
              onChange={e => setFormData({...formData, detail: e.target.value})}
            ></textarea>
          </div>

          {/* Image Upload Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Product Images</label>
            <label className="block p-6 border-4 border-dashed border-slate-100 rounded-[2rem] hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer text-center group">
              <input type="file" multiple className="hidden" onChange={onFileChange} />
              <Upload className="mx-auto text-slate-300 group-hover:text-blue-500 group-hover:scale-110 transition-all mb-2" size={32} />
              <p className="text-[10px] font-black text-slate-400 uppercase group-hover:text-blue-600 transition-colors">ចុចដើម្បីជ្រើសរើសរូបភាព</p>
            </label>
          </div>

          {/* Image Previews */}
          {previews.length > 0 && (
            <div className="flex gap-3 overflow-x-auto py-2 scrollbar-hide">
              {previews.map((src, i) => (
                <div key={i} className="relative flex-shrink-0">
                  <img src={src} className="w-20 h-20 rounded-2xl object-cover shadow-md border-2 border-white" alt="" />
                  <div className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-200 active:scale-95 transition-all mt-4"
          >
            {isEditMode ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;