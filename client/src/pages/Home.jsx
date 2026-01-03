import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Banner from '../components/Banner'; 
import ProductCard from '../components/ProductCard';
import { Search, FilterX, LayoutGrid, Loader2, Phone, Mail, Facebook, Send, ArrowUpRight } from 'lucide-react';

const Home = () => {
  const { slug } = useParams();
  const [allProducts, setAllProducts] = useState([]);
  const [displayProducts, setDisplayProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // ១. ទាញទិន្នន័យផលិតផលពី Server API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/data');
        const data = await res.json();
        setAllProducts(data.products || []);
        setLoading(false);
      } catch (err) {
        console.error("មិនអាចទាញទិន្នន័យបានឡើយ:", err);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // ២. មុខងារ Filter
  useEffect(() => {
    let result = allProducts;
    if (slug) {
      result = result.filter(p => p.category?.toLowerCase() === slug.toLowerCase());
    }
    if (searchTerm) {
      result = result.filter(p => 
        p.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setDisplayProducts(result);
  }, [slug, searchTerm, allProducts]);

  // មុខងារជំនួយ៖ ពេលចុចលើទំនិញ ឱ្យវាអូសទៅលើបំផុតនៃទំព័រថ្មី
  const handleProductClick = () => {
    window.scrollTo(0, 0);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      
      <section className="w-full">
        <Banner />
      </section>
      
      <main className="container mx-auto py-10 px-4 max-w-7xl">
        
        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto relative group">
          <input 
            type="text" 
            placeholder="ស្វែងរកផលិតផលដែលអ្នកចង់បាន..." 
            className="w-full py-4 px-14 rounded-2xl border-none shadow-xl shadow-blue-900/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 font-medium bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="absolute left-5 top-4 text-slate-400 group-hover:text-blue-500 transition-colors" size={24} />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-5 top-4 text-slate-300 hover:text-red-500 transition-colors">
              <FilterX size={20} />
            </button>
          )}
        </div>

        {/* Section Title */}
        <div className="flex items-center justify-between mb-10 border-b border-slate-200 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-200">
                <LayoutGrid className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">
              {slug ? `ប្រភេទ៖ ${slug}` : "ទំនិញទាំងអស់"}
            </h2>
          </div>
          {slug && (
            <Link to="/" className="text-sm font-bold text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-xl transition">
              បង្ហាញទាំងអស់វិញ
            </Link>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
            <p className="text-slate-400 font-bold animate-pulse">កំពុងទាញទិន្នន័យទំនិញ...</p>
          </div>
        ) : (
          <>
            {displayProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {displayProducts.map((product) => (
                  <Link 
                    key={product.id} 
                    to={`/product/${product.id}`} 
                    onClick={handleProductClick}
                    className="group relative block"
                  >
                    {/* Overlay Icon ពេល Hover លើរូប */}
                    <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-[-10px] group-hover:translate-y-0">
                        <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg text-blue-600">
                            <ArrowUpRight size={20} />
                        </div>
                    </div>

                    <ProductCard 
                      name={product.name} 
                      price={product.price} 
                      image={product.images ? product.images[0] : product.image}
                    />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                    <FilterX size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800">ស្វែងរកមិនឃើញទំនិញឡើយ!</h3>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer (រក្សាកូដដើម) */}
      <footer className="bg-slate-900 text-slate-400 pt-16 pb-8 mt-20">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12 border-b border-slate-800 pb-12">
            <div>
              <h3 className="text-2xl font-black text-white italic mb-6">24 STORE</h3>
              <p className="text-sm leading-relaxed">ហាងលក់ទំនិញអនឡាញឈានមុខគេ ដែលផ្តល់ជូនផលិតផលមានគុណភាព និងតម្លៃសមរម្យបំផុត។</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 italic uppercase tracking-wider">Contact Us</h4>
              <ul className="space-y-4 text-sm">
                <li className="flex items-center gap-3"><Phone size={16} className="text-blue-500" /> 012 345 678</li>
                <li className="flex items-center gap-3"><Mail size={16} className="text-blue-500" /> support@24store.com</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6 italic uppercase tracking-wider">Social Media</h4>
              <div className="flex gap-4 text-white">
                <Facebook className="hover:text-blue-500 cursor-pointer" />
                <Send className="hover:text-sky-400 cursor-pointer" />
              </div>
            </div>
          </div>
          <p className="text-center text-[10px] uppercase tracking-widest">© 2024 24 STORE. All Rights Reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;