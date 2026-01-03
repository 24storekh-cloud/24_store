import React from 'react';
import API_URL from '../apiConfig';

const ProductCard = ({ name, price, image }) => {
  
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/400x400?text=No+Image';

    // បើក្នុង Database ជាប់ localhost ត្រូវដូរទៅជា Link Render ភ្លាម
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }

    // បើជា Path ខ្លី (uploads/...)
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/${img}`;
    }

    return img;
  };

  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50">
        <img 
          src={getImageUrl(image)} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          onError={(e) => { 
            e.target.onerror = null; 
            // ប្តូរពី via.placeholder មក placehold.co វិញ
            e.target.src = 'https://placehold.co/400x400?text=Image+Not+Found'; 
          }}
        />
      </div>
      <div className="p-4">
        <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">{name}</h3>
        <p className="text-blue-600 font-black text-lg">${Number(price).toLocaleString()}</p>
        <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition">
          មើលលម្អិត
        </button>
      </div>
    </div>
  );
};

export default ProductCard;