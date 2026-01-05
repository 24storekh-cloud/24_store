import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import API_URL from '../apiConfig';
import toast from 'react-hot-toast';

const BannerSection = ({ banners, onDelete, onUpload, getCleanUrl }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ១. មុខងារសម្អាត Memory (Revoke URL) ដើម្បីកុំឱ្យទូរស័ព្ទ/កុំព្យូទ័រដើរយឺត
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ២. មុខងាររៀបចំ URL រូបភាព (ដោះស្រាយបញ្ហា HTTPS/Mixed Content)
  const renderBannerImage = useCallback((imgName) => {
    if (!imgName) return 'https://placehold.co/800x400?text=No+Image';
    
    // បើសិនជា Link មកពី Database ជាប្រភេទ Full URL (http://...)
    if (typeof imgName === 'string' && imgName.startsWith('http')) {
      // បើវេបសាយដើរលើ HTTPS (Vercel) តែ Link រូបភាពជា localhost (HTTP)
      if (imgName.includes('localhost:5000') && !window.location.hostname.includes('localhost')) {
         const pathOnly = imgName.split('/uploads/')[1];
         return `${API_URL}/uploads/${pathOnly}`;
      }
      return imgName;
    }

    // បើមកតែឈ្មោះ File ធម្មតា
    const cleanPath = typeof imgName === 'string' ? imgName.replace('uploads/', '') : '';
    return `${API_URL}/uploads/${cleanPath}`;
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
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
    // បញ្ជាក់៖ ប្រើ 'images' ឱ្យដូចទៅនឹង App.js ដើម្បីឱ្យ Backend ងាយស្រួលចាប់យក
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
        if (onUpload) await onUpload(); // មុខងារនេះនឹងទៅហៅ fetchData() ក្នុង App.js
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-none">Promotion Banners</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Web Content Management</p>
        </div>
        <button 
          onClick={() => {
            setShowUpload(!showUpload);
            if (preview) setPreview(null);
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg 
            ${showUpload ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-blue-100 hover:bg-blue-700 active:scale-95'}`}
        >
          {showUpload ? <X size={18}/> : <Plus size={18}/>}
          {showUpload ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Banner Title</label>
                <input 
                  type="text" 
                  placeholder="Ex: New Year Sale"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 border border-transparent"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              <label className={`flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-[2rem] cursor-pointer group ${preview ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50 hover:bg-slate-50'}`}>
                <Upload className={`${preview ? 'text-blue-500' : 'text-slate-300'} mb-2`} />
                <span className="text-[10px] font-black text-slate-400 uppercase text-center truncate w-full px-4">
                  {file ? file.name : 'Select Banner Image'}
                </span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              </label>
            </div>
            <div className="relative aspect-[21/9] flex items-center justify-center bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover animate-in fade-in" alt="Preview" />
              ) : (
                <div className="text-center">
                  <ImageIcon className="text-slate-200 mx-auto mb-2" size={32} />
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">Live Preview</p>
                </div>
              )}
            </div>
          </div>
          <button type="submit" disabled={isUploading} className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black hover:bg-blue-700 disabled:bg-slate-400 flex justify-center items-center gap-3">
            {isUploading ? <><Loader2 size={20} className="animate-spin" /> Processing...</> : 'Confirm & Publish'}
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners && banners.length > 0 ? (
          banners.map(b => (
            <div key={b.id || b._id} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border-4 border-white hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[21/9] overflow-hidden bg-slate-100">
                <img 
                  // ប្រើ getCleanUrl ដែលបញ្ជូនមកពី App.js វានឹងមានប្រសិទ្ធភាពជាង
                  src={getCleanUrl(b.image)} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={b.title} 
                  onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Image+Load+Failed'; }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-end p-8">
                <h4 className="text-white text-xl font-black italic uppercase truncate translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  {b.title}
                </h4>
                <div className="flex justify-between items-center mt-3 opacity-0 group-hover:opacity-100 transition-all">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Active Banner</p>
                  <button 
                    onClick={() => {
                      // ត្រូវប្រាកដថា onDelete បញ្ជូន 'banner' និង 'id' ទៅកាន់ App.js
                      const targetId = b.id || b._id;
                      onDelete('banner', targetId);
                    }} 
                    className="p-3 bg-red-500 text-white rounded-xl active:scale-90 hover:bg-red-600 transition-colors shadow-lg"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50 text-slate-300 font-black uppercase italic">
            No active banners found
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSection;