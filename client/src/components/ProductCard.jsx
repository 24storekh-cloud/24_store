import React from 'react';
import API_URL from '../apiConfig';

const ProductCard = ({ name, price, image }) => {
  // បង្កើត Function ដើម្បីត្រួតពិនិត្យ Link រូបភាព
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    
    // បើ image ជា Link ពេញ (https://...) រួចហើយ ប្រើវាហ្មង
    if (img.startsWith('http')) return img;
    
    // បើ image ជាឈ្មោះ file (uploads/...) ត្រូវភ្ជាប់ជាមួយ API_URL របស់ Render
    return `${API_URL}/${img}`;
  };

  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50">
        <img 
          src={getImageUrl(image)} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          // បន្ថែម Error handling បើ Server រក File រូបភាពមិនឃើញ
          onError={(e) => { 
            e.target.onerror = null; // ការពារ loop បើ placeholder ក៏ error
            e.target.src = 'https://placehold.co/600x400?text=Image+Not+Found'; 
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