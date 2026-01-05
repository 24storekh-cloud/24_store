import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Upload, X, Loader2 } from 'lucide-react';
import API_URL from '../apiConfig';

const BannerSection = ({ banners, onDelete, onUpload }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // ១. មុខងារសម្អាត Memory (Revoke URL)
  useEffect(() => {
    return () => {
      if (preview && preview.startsWith('blob:')) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // ២. កែសម្រួលមុខងារបង្ហាញ URL រូបភាពឱ្យត្រូវជាមួយ Folder /uploads
  const getBannerUrl = (imgName) => {
    if (!imgName) return 'https://placehold.co/800x400?text=No+Banner';
    
    // បើជា Base64 ចាស់ (ការពារ Error លើទិន្នន័យចាស់)
    if (typeof imgName === 'string' && imgName.startsWith('data:')) {
      return imgName;
    }
    
    // បើជាឈ្មោះ File (ឧទាហរណ៍៖ 1735912345.jpg) យើងទាញពី /uploads របស់ Backend
    return `${API_URL}/uploads/${imgName}`;
  };

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
    if (!file || !title) return alert("សូមបំពេញឈ្មោះ និងជ្រើសរើសរូបភាព!");
    
    setIsUploading(true);
    
    // ត្រូវប្រើ FormData ដើម្បីផ្ញើ File ទៅកាន់ Backend
    const formData = new FormData();
    formData.append('type', 'banner');
    formData.append('title', title);
    formData.append('images', file); // 'images' ត្រូវតែដូចឈ្មោះក្នុង upload.array('images') នៅ backend

    try {
      // បញ្ជូន formData ទាំងមូលទៅកាន់ onUpload ក្នុង Admin.jsx
      await onUpload(formData);

      // Reset Form ក្រោយជោគជ័យ
      setTitle(''); 
      setFile(null); 
      setPreview(null); 
      setShowUpload(false);
      alert("បង្ហោះ Banner ជោគជ័យ!");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("ការបង្ហោះរូបភាពមានបញ្ហា! (Error 500)");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-black text-slate-800 uppercase italic">Promotion Banners</h3>
          <p className="text-xs text-slate-500 font-bold">គ្រប់គ្រងរូបភាពផ្សព្វផ្សាយនៅលើគេហទំព័រ</p>
        </div>
        <button 
          onClick={() => {
            setShowUpload(!showUpload);
            if (preview) setPreview(null);
          }}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg 
            ${showUpload ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
        >
          {showUpload ? <X size={18}/> : <Plus size={18}/>}
          {showUpload ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {/* Form Upload */}
      {showUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl space-y-4 animate-in zoom-in-95">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 ml-2 uppercase">Banner Title</label>
                <input 
                  type="text" 
                  placeholder="ឧទាហរណ៍៖ បញ្ចុះតម្លៃ ៥០% សម្រាប់ឆ្នាំថ្មី"
                  className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500 transition-all"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isUploading}
                />
              </div>
              
              <label className={`flex flex-col items-center justify-center p-6 border-4 border-dashed rounded-[2rem] transition-all cursor-pointer
                ${preview ? 'border-blue-100 bg-blue-50/30' : 'border-slate-100 hover:bg-slate-50'}`}>
                <Upload className={`${preview ? 'text-blue-500' : 'text-slate-300'} mb-2`} />
                <span className="text-xs font-black text-slate-400 uppercase text-center">
                  {file ? file.name : 'ជ្រើសរើសរូបភាព Banner'}
                </span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" disabled={isUploading} />
              </label>
            </div>
            
            {/* Preview Area */}
            <div className="relative group min-h-[160px] flex items-center justify-center bg-slate-50 rounded-2xl overflow-hidden border border-slate-100">
              {preview ? (
                <img src={preview} className="w-full h-40 object-cover" alt="Preview" />
              ) : (
                <div className="text-center p-4">
                  <p className="text-[10px] font-black text-slate-300 uppercase italic">រង់ចាំមើលរូបភាពទីនេះ</p>
                </div>
              )}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isUploading}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 disabled:bg-slate-400 disabled:shadow-none flex justify-center items-center gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Processing...
              </>
            ) : 'Confirm Upload Banner'}
          </button>
        </form>
      )}

      {/* Grid បង្ហាញ Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners && banners.length > 0 ? (
          banners.map(b => (
            <div key={b.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-white hover:shadow-xl transition-all">
              <img 
                src={getBannerUrl(b.image)} 
                className="w-full h-52 object-cover transition-transform duration-500 group-hover:scale-110" 
                alt={b.title} 
                onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Image+Load+Failed'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-6">
                <h4 className="text-white font-black italic uppercase tracking-wide truncate">{b.title}</h4>
                <p className="text-white/60 text-[10px] font-bold">Banner ID: {b.id}</p>
                
                <button 
                  onClick={() => {
                    if(window.confirm('តើអ្នកច្បាស់ទេថានឹងលុប Banner នេះ?')) onDelete('banner', b.id);
                  }}
                  className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-all md:opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={18}/>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
            <p className="font-black text-slate-300 uppercase italic">មិនទាន់មាន Banner ផ្សព្វផ្សាយនៅឡើយ</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BannerSection;