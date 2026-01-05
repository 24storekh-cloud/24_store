import React from 'react';
import API_URL from '../apiConfig';

const ProductCard = ({ name, price, image }) => {
  
  const getImageUrl = (img) => {
    // ១. ករណីគ្មានរូបភាព
    if (!img) return 'https://placehold.co/400x400?text=No+Image';

    // ២. ករណីរូបភាពជា Array (យកតែរូបទី១)
    let finalImg = Array.isArray(img) ? img[0] : img;

    if (typeof finalImg !== 'string') return 'https://placehold.co/400x400?text=Invalid+Data';

    // ៣. បើជាប្រភេទ Base64 (data:image/...) ឱ្យវាបង្ហាញផ្ទាល់តែម្ដង
    if (finalImg.startsWith('data:')) {
      return finalImg;
    }

    // ៤. បើក្នុង Database ជាប់ localhost ត្រូវដូរទៅជា Link Render ភ្លាម
    if (finalImg.includes('localhost:5000')) {
      return finalImg.replace('http://localhost:5000', API_URL);
    }

    // ៥. បើជា Path ខ្លី (uploads/...) ត្រូវបន្ថែម API_URL
    if (!finalImg.startsWith('http')) {
      // លាងសញ្ញា / ដើម្បីកុំឱ្យជាន់គ្នា (ឧទាហរណ៍៖ ...com//uploads)
      const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
      const cleanPath = finalImg.startsWith('/') ? finalImg.slice(1) : finalImg;
      return `${baseUrl}/${cleanPath}`;
    }

    return finalImg;
  };

  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500 flex flex-col h-full">
      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50">
        <img 
          src={getImageUrl(image)} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { 
            // បើនៅតែ Error ទៀត ដាក់រូប Not Found
            if (e.target.src !== 'https://placehold.co/400x400?text=Image+Not+Found') {
              e.target.src = 'https://placehold.co/400x400?text=Image+Not+Found'; 
            }
          }}
        />
      </div>
      
      <div className="px-2 pb-2 flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
          {name}
        </h3>
        <p className="text-blue-600 font-black text-xl">
          ${Number(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
        
        <div className="mt-auto pt-4">
          <button className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold hover:bg-blue-600 transition-all shadow-lg shadow-slate-100 active:scale-95">
            មើលលម្អិត
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;