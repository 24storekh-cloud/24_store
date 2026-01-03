import React, { useState } from 'react';
import { Plus, Trash2, Upload, X } from 'lucide-react';
import API_URL from '../apiConfig'; // ១. កុំភ្លេច Import API_URL

const BannerSection = ({ banners, onDelete, onUpload }) => {
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // ២. បង្កើត Function សម្រាប់ឆែក Link រូបភាព
  const getBannerUrl = (img) => {
    if (!img) return 'https://placehold.co/800x400?text=No+Banner';
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

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !title) return alert("សូមបំពេញឈ្មោះ និងជ្រើសរើសរូបភាព!");
    
    // បញ្ជូនទៅកាន់ Props onUpload (ដែលស្ថិតនៅ Admin.jsx)
    onUpload(title, file);

    // Reset form
    setTitle(''); 
    setFile(null); 
    setPreview(null); 
    setShowUpload(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-black text-slate-800 uppercase italic">Promotion Banners</h3>
        <button 
          onClick={() => setShowUpload(!showUpload)}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg 
            ${showUpload ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'}`}
        >
          {showUpload ? <X size={18}/> : <Plus size={18}/>}
          {showUpload ? 'Cancel' : 'Add Banner'}
        </button>
      </div>

      {showUpload && (
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-[2.5rem] border border-blue-100 shadow-xl space-y-4 animate-in zoom-in-95">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="space-y-4">
              <input 
                type="text" placeholder="ចំណងជើង Banner (ឧទាហរណ៍៖ បញ្ចុះតម្លៃ ៥០%)"
                className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500"
                value={title} onChange={(e) => setTitle(e.target.value)}
              />
              <label className="flex flex-col items-center justify-center p-6 border-4 border-dashed border-slate-100 rounded-[2rem] hover:bg-slate-50 cursor-pointer transition-all">
                <Upload className="text-slate-300 mb-2" />
                <span className="text-xs font-black text-slate-400 uppercase">ជ្រើសរើសរូបភាព Banner</span>
                <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
              </label>
            </div>
            
            {preview && (
              <div className="relative group">
                <img src={preview} className="w-full h-40 object-cover rounded-2xl shadow-md" alt="Preview" />
                <p className="text-center text-[10px] font-bold text-slate-400 mt-2">រូបភាពដែលបានជ្រើសរើស</p>
              </div>
            )}
          </div>
          <button type="submit" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700">
            Confirm Upload Banner
          </button>
        </form>
      )}

      {/* បញ្ជី Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {banners.map(b => (
          <div key={b.id} className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-white">
            {/* ៣. ប្រើ getBannerUrl ដើម្បីការពារ Error localhost */}
            <img 
              src={getBannerUrl(b.image)} 
              className="w-full h-48 object-cover transition-transform group-hover:scale-105" 
              alt={b.title} 
              onError={(e) => { e.target.src = 'https://placehold.co/800x400?text=Banner+Error'; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent flex flex-col justify-end p-6">
              <h4 className="text-white font-black italic uppercase">{b.title}</h4>
              <button onClick={() => onDelete('banner', b.id)} className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={18}/>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BannerSection;