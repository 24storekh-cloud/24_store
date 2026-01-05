import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';
import API_URL from '../apiConfig';
import toast from 'react-hot-toast';

const BannerSection = ({ banners, onDelete, onUpload, getCleanUrl }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ១. មុខងារសម្អាត Memory (Revoke URL) ដើម្បីកុំឱ្យស្ទះ Browser
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
      // បញ្ជូនទៅកាន់ API ផ្ទាល់
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
        // បញ្ជាឱ្យ Component មេ (AdminDashboard) ទាញទិន្នន័យថ្មី
        onUpload(); 
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
      {/* Header */}
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

      {/* Form Upload */}
      {showUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-50 shadow-xl space-y-4 animate-in zoom-in-95 duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 ml-2 uppercase tracking-widest">Banner Title</label>
                <input 
                  type="text" 
                  placeholder="Ex: New Year Sale 50% Off"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all border border-transparent focus:bg-white"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <label className={`flex flex-col items-center justify-center p-8 border-4 border-dashed rounded-[2rem] transition-all cursor-pointer group
                ${preview ? 'border-blue-100 bg-blue-50/30' : 'border-slate-50 hover:bg-slate-50 hover:border-blue-200'}`}>
                <Upload className={`${preview ? 'text-blue-500' : 'text-slate-300'} mb-2 group-hover:scale-110 transition-transform`} />
                <span className="text-[10px] font-black text-slate-400 uppercase text-center tracking-tighter">
                  {file ? file.name : 'Select Banner Image'}
                </span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              </label>
            </div>
            
            {/* Preview Area */}
            <div className="relative h-full min-h-[180px] flex items-center justify-center bg-slate-50 rounded-[2rem] overflow-hidden border border-slate-100 shadow-inner">
              {preview ? (
                <img src={preview} className="w-full h-full object-cover animate-in fade-in duration-500" alt="Preview" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">Live Preview</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none flex justify-center items-center gap-3 transition-all active:scale-[0.98] uppercase italic"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Uploading to Server...
              </>
            ) : 'Confirm & Publish Banner'}
          </button>
        </form>
      )}

      {/* Grid Display */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
        {banners && banners.length > 0 ? (
          banners.map(b => (
            <div key={b.id || b._id} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border-4 border-white hover:shadow-2xl transition-all duration-500">
              <div className="aspect-[21/9] overflow-hidden">
                <img 
                  src={getCleanUrl ? getCleanUrl(b.image) : `${API_URL}/uploads/${b.image}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  alt={b.title} 
                  onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Banner+Not+Found'; }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-8">
                <h4 className="text-white text-xl font-black italic uppercase tracking-wide truncate transform translate-y-2 group-hover:translate-y-0 transition-transform">{b.title}</h4>
                <div className="flex justify-between items-center mt-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Active Promotion</p>
                  <button 
                    onClick={() => onDelete('banner', b.id || b._id)}
                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all shadow-lg"
                  >
                    <Trash2 size={18}/>
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-24 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-50">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="text-slate-200" size={32} />
            </div>
            <p className="font-black text-slate-300 uppercase italic tracking-widest">No banners active on website</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSection;