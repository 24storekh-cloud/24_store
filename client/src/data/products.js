import React, { useState, useEffect } from 'react';
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/api/data')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch((err) => console.error("Error:", err));
  }, []);

  if (loading) return <div className="text-center py-20 font-bold">កំពុងផ្ទុកទិន្នន័យ...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-black text-slate-800 mb-10 uppercase italic border-l-8 border-blue-600 pl-4">
        ផលិតផលថ្មីៗ
      </h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};

// សមាសភាគ Card សម្រាប់បង្ហាញទំនិញនីមួយៗ
const ProductCard = ({ product }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const images = product.images || [];

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden group hover:shadow-2xl transition-all duration-500 flex flex-col">
      {/* ផ្នែករូបភាព */}
      <div className="relative h-72 overflow-hidden bg-slate-50">
        <img
          src={images[currentImg]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* ប៊ូតុងបញ្ជាស្លាយរូបភាព (បង្ហាញតែពេលមានរូបលើសពី ១) */}
        {images.length > 1 && (
          <div className="absolute inset-0 flex items-center justify-between px-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={prevImage} className="p-1 bg-white/80 rounded-full shadow-md hover:bg-white text-slate-800">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextImage} className="p-1 bg-white/80 rounded-full shadow-md hover:bg-white text-slate-800">
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* ចំណុចតូចៗបង្ហាញពីចំនួនរូបភាព */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${currentImg === i ? 'w-4 bg-blue-600' : 'w-1.5 bg-white/60'}`} />
          ))}
        </div>
      </div>

      {/* ផ្នែកព័ត៌មាន */}
      <div className="p-6 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
            {product.category}
          </span>
          <span className={`text-[10px] font-black uppercase ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {product.stock > 0 ? `ក្នុងស្តុក: ${product.stock}` : 'អស់ស្តុក'}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        
        <p className="text-slate-500 text-xs line-clamp-2 mb-4 flex-1">
          {product.detail}
        </p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-tighter">តម្លៃ</span>
            <span className="text-2xl font-black text-slate-900">${product.price}</span>
          </div>
          
          <button className="bg-slate-900 text-white p-4 rounded-2xl hover:bg-blue-600 transition-all shadow-lg active:scale-90">
            <ShoppingCart size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Products;