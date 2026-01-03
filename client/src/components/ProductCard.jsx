import React from 'react';

const ProductCard = ({ name, price, image }) => {
  return (
  <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group hover:shadow-xl transition-all duration-500">
      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
          // បន្ថែម Error handling បើគ្មានរូបភាព
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=No+Image'; }}
        />
      </div>
    <div className="p-4">
      <h3 className="font-bold text-slate-800 line-clamp-1 mb-1">{name}</h3>
      <p className="text-blue-600 font-black text-lg">${price}</p>
      <button className="w-full mt-4 bg-blue-50 text-blue-600 py-2 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition">
        មើលលម្អិត
      </button>
    </div>
  </div>
  );
};
export default ProductCard;