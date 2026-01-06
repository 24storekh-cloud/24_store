import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import API_URL from '../apiConfig';
import Banner from '../components/Banner'; 
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';
import { LayoutGrid, Loader2, FilterX } from 'lucide-react';

const Home = () => {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchKeyword = searchParams.get('search');
  
  const { addToCart } = useCart(); 
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // ១. ទាញទិន្នន័យផលិតផលដំបូង
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/api/data`);
      const data = await res.json();
      setAllProducts(data.products || []);
      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchProducts(); 
  }, []);

  // ២. Filter ផលិតផលតាមប្រភេទ និងការស្វែងរក
  useEffect(() => {
    let result = allProducts;
    if (slug) {
      result = result.filter(p => p.category?.toLowerCase() === slug.toLowerCase());
    }
    if (searchKeyword) {
      result = result.filter(p => p.name?.toLowerCase().includes(searchKeyword.toLowerCase()));
    }
    setDisplayProducts(result);
  }, [slug, searchKeyword, allProducts]);

  // ៣. មុខងារ Add To Cart (កែសម្រួលថ្មីដើម្បីកុំឱ្យ Error)
  const handleAddToCartAction = async (product) => {
    try {
      // Step A: បន្ថែមចូលកន្ត្រកក្នុង Browser ជាមុនសិន (ឱ្យ User ឃើញកន្ត្រកឡើងលេខភ្លាម)
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.images ? product.images[0] : product.image
      });

      // Step B: ប្តូរលេខស្តុកក្នុង UI ភ្លាមៗ (Optimistic Update)
      setAllProducts(prev => prev.map(p => 
        p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
      ));

      // Step C: ព្យាយាមបាញ់ទៅ API កាត់ស្តុកក្នុង Server
      // យើងមិនប្រើ await res.json() ភ្លាមៗទេ ដើម្បីការពារ Error 404 (HTML response)
      const res = await fetch(`${API_URL}/api/products/${product.id}/reduce-stock`, { 
        method: 'PATCH' 
      });

      if (!res.ok) {
        console.warn("Backend API មិនទាន់ដើរ (404), ប៉ុន្តែទំនិញត្រូវបានបន្ថែមចូលកន្ត្រករួចរាល់។");
      }
    } catch (err) {
      // បើ API server ងាប់ ក៏វានៅតែ Add ចូលកន្ត្រកបានដែរ
      console.error("API Connection Error:", err);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen">
      <Banner />
      
      <main className="container mx-auto py-10 px-4 max-w-7xl">
        {/* Section Header */}
        <div className="flex items-center gap-3 mb-10 border-b border-slate-100 pb-6">
          <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 text-white">
            <LayoutGrid size={22} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 uppercase italic tracking-tight">
            {slug ? `Category: ${slug}` : searchKeyword ? `Search: ${searchKeyword}` : "ទំនិញទាំងអស់"}
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center py-32 text-slate-400">
            <Loader2 className="animate-spin mb-4" size={48} />
            <p className="font-bold">កំពុងរៀបចំទំនិញ...</p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
              {displayProducts.map((product) => (
                <ProductCard 
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  stock={product.stock}
                  image={product.images ? product.images[0] : product.image}
                  onAddToCart={() => handleAddToCartAction(product)} 
                />
              ))}
            </div>

            {/* Empty State */}
            {displayProducts.length === 0 && (
              <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                <FilterX className="mx-auto text-slate-200 mb-6" size={64} />
                <h3 className="text-xl font-black text-slate-800">ស្វែងរកមិនឃើញទំនិញឡើយ!</h3>
                <p className="text-slate-400 mt-2">សូមសាកល្បងស្វែងរកឈ្មោះផ្សេង ឬត្រឡប់ទៅដើមវិញ។</p>
                <button 
                  onClick={() => window.location.href = '/'}
                  className="mt-6 px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase"
                >
                  បង្ហាញទំនិញទាំងអស់
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Home;