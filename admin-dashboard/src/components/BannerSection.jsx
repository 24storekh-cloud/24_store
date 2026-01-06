import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, X, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import API_URL from '../apiConfig';
import toast from 'react-hot-toast';

const BannerSection = ({ banners, onDelete, onUpload, getCleanUrl }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // សម្អាត Memory
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      // បន្ថែមការត្រួតពិនិត្យទំហំ File (ឧទាហរណ៍ មិនឱ្យលើស 2MB)
      if (selected.size > 2 * 1024 * 1024) {
        return toast.error("រូបភាពធំពេក! សូមជ្រើសរើសរូបភាពក្រោម 2MB");
      }
      if (preview) URL.revokeObjectURL(preview);
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title) return toast.error("សូមបំពេញឈ្មោះ និងជ្រើសរើសរូបភាព!");
    
    setIsUploading(true);
    const loadingToast = toast.loading("កំពុងបង្ហោះ Banner...");
    
    const formData = new FormData();
    formData.append('type', 'banner');
    formData.append('title', title);
    formData.append('images', file); 

    try {
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        toast.success("បង្ហោះ Banner ជោគជ័យ!", { id: loadingToast });
        setTitle(''); 
        setFile(null); 
        setPreview(null); 
        setShowUpload(false);
        if (onUpload) await onUpload(); 
      } else {
        throw new Error("Upload Failed");
      }
    } catch (error) {
      toast.error("ការបង្ហោះមានបញ្ហា!", { id: loadingToast });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-50">
        <div className="flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-500 shadow-inner">
             <Sparkles size={24} />
          </div>
          <div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none tracking-tight">Promotion Banners</h3>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
               <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
               Web Content Management
            </p>
          </div>
        </div>
        <button 
          onClick={() => {
            setShowUpload(!showUpload);
            if (preview) setPreview(null);
          }}
          className={`group flex items-center gap-3 px-8 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl active:scale-95
            ${showUpload 
              ? 'bg-slate-100 text-slate-500 hover:bg-red-50 hover:text-red-500' 
              : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1'}`}
        >
          {showUpload ? <X size={20} strokeWidth={3}/> : <Plus size={20} strokeWidth={3}/>}
          {showUpload ? 'Cancel' : 'Add New Banner'}
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] border-2 border-blue-50 shadow-2xl space-y-6 animate-in zoom-in-95 duration-500 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-[0.03] pointer-events-none">
             <ImageIcon size={150} />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative z-10">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Banner Title</label>
                <input 
                  type="text" 
                  placeholder="Ex: 50% OFF - Summer Collection"
                  className="w-full p-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold focus:ring-4 focus:ring-blue-500/10 border-2 border-transparent focus:border-blue-500 transition-all text-slate-700"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <label className={`flex flex-col items-center justify-center p-10 border-4 border-dashed rounded-[2.5rem] cursor-pointer group transition-all duration-300
                ${preview ? 'border-blue-200 bg-blue-50/20' : 'border-slate-100 hover:bg-slate-50 hover:border-blue-200'}`}>
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                   <Upload className={`${preview ? 'text-blue-500' : 'text-slate-300'}`} size={28} />
                </div>
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">
                  {file ? file.name : 'Select JPG/PNG Image'}
                </span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              </label>
            </div>
            
            <div className="lg:col-span-3 space-y-3">
               <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Live Preview (21:9)</label>
               <div className="relative aspect-[21/9] flex items-center justify-center bg-slate-100 rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl ring-1 ring-slate-100">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
                ) : (
                  <div className="text-center opacity-30">
                    <ImageIcon className="text-slate-400 mx-auto mb-3" size={48} />
                    <p className="text-[10px] font-black text-slate-500 uppercase italic tracking-[0.2em]">Waiting for image...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={isUploading} className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-100 active:scale-[0.98] transition-all flex justify-center items-center gap-4 uppercase italic tracking-widest mt-4">
            {isUploading ? <><Loader2 size={24} className="animate-spin" /> Publishing...</> : <><Sparkles size={20}/> Confirm & Publish</>}
          </button>
        </form>
      )}

      {/* Banner Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners && banners.length > 0 ? (
          banners.map((b, index) => (
            <div key={b.id || b._id} className="group relative bg-white rounded-[3rem] overflow-hidden shadow-sm border-8 border-white hover:shadow-2xl transition-all duration-700 hover:-translate-y-2">
              <div className="aspect-[21/9] overflow-hidden bg-slate-100">
                <img 
                  src={getCleanUrl(b.image || b.img)} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={b.title} 
                  onError={(e) => { e.target.src = 'https://placehold.co/1200x600?text=Banner+Not+Found'; }}
                />
              </div>
              
              {/* Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-10">
                <div className="translate-y-10 group-hover:translate-y-0 transition-transform duration-500">
                  <span className="px-4 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.3em] rounded-full mb-3 inline-block">
                     Position #{index + 1}
                  </span>
                  <h4 className="text-white text-2xl font-black italic uppercase leading-tight mb-4">
                    {b.title}
                  </h4>
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <p className="text-slate-300 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                       <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Active Now
                    </p>
                    <button 
                      onClick={() => onDelete('banner', b.id || b._id)} 
                      className="p-4 bg-white/10 hover:bg-red-500 text-white rounded-2xl active:scale-90 transition-all backdrop-blur-md border border-white/20"
                    >
                      <Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-32 text-center bg-white rounded-[4rem] border-4 border-dashed border-slate-100">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <ImageIcon size={40} className="text-slate-200" />
            </div>
            <p className="font-black text-slate-300 uppercase italic tracking-[0.4em] text-sm ml-4">No active banners found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSection;