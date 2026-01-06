import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';
import { ShoppingCart, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ id, name, price, image, stock = 0, onAddToCart }) => {
  const [localStock, setLocalStock] = useState(parseInt(stock) || 0);

  useEffect(() => {
    setLocalStock(parseInt(stock) || 0);
  }, [stock]);

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/400x400?text=No+Image';
    let finalImg = Array.isArray(img) ? img[0] : img;
    if (finalImg.startsWith('data:')) return finalImg;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return finalImg.startsWith('http') ? finalImg : `${baseUrl}/${finalImg.replace(/^\//, '')}`;
  };

  const handleAddToCartClick = (e) => {
    e.preventDefault();
    if (localStock > 0) {
      // ហៅ Function ទៅកាន់ Home.jsx
      if (onAddToCart) {
        onAddToCart(); 
      }
      setLocalStock(prev => prev - 1);
      toast.success(`បន្ថែម ${name} ជោគជ័យ!`);
    } else {
      toast.error("អស់ស្តុកហើយ!");
    }
  };

  const isOutOfStock = localStock <= 0;

  return (
    <div className="bg-white rounded-[2rem] p-4 shadow-sm border border-slate-100 group flex flex-col h-full">
      <div className="relative h-48 mb-4 overflow-hidden rounded-[1.5rem] bg-slate-50">
        <img src={getImageUrl(image)} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-lg text-white text-[10px] font-bold">
          Stock: {localStock}
        </div>
      </div>
      
      <div className="flex flex-col flex-grow">
        <h3 className="font-bold text-slate-800 text-sm md:text-base line-clamp-1 italic uppercase">{name}</h3>
        <p className="text-blue-600 font-black text-xl mb-4">${Number(price).toFixed(2)}</p>

        <div className="mt-auto flex gap-2">
          <Link to={`/product/${id}`} className="p-3 bg-slate-100 rounded-xl text-slate-500 hover:bg-slate-200 transition">
            <Eye size={18} />
          </Link>
          <button 
            onClick={handleAddToCartClick}
            disabled={isOutOfStock}
            className={`flex-1 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-2 transition ${
              isOutOfStock ? 'bg-slate-100 text-slate-400' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100'
            }`}
          >
            <ShoppingCart size={16} /> {isOutOfStock ? 'Sold Out' : 'Add To Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;