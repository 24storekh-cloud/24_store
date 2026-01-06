import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Home, Smartphone, Laptop, Headphones, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // បញ្ជីប្រភេទផលិតផល
  const categories = [
    { name: 'ទាំងអស់', icon: <Home size={16} />, path: '/' },
    { name: 'ទូរស័ព្ទ', icon: <Smartphone size={16} />, path: '/category/phone' },
    { name: 'កុំព្យូទ័រ', icon: <Laptop size={16} />, path: '/category/laptop' },
    { name: 'គ្រឿងបន្លាស់', icon: <Headphones size={16} />, path: '/category/accessories' },
  ];

  // មុខងារ Search (ពេលចុច Enter ឬ ចុចរូបកែវពង្រីក)
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // បញ្ជូនពាក្យគន្លឹះទៅកាន់ URL parameter
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 shadow-md w-full">
      {/* របារមេ (Main Navbar) */}
      <nav className="bg-blue-600 text-white py-3 md:py-4">
        <div className="container mx-auto px-4 flex items-center justify-between gap-4 md:gap-8">
          
          {/* ១. Logo */}
          <Link to="/" className="text-xl md:text-3xl font-black tracking-tighter shrink-0 italic">
            24 STORE
          </Link>

          {/* ២. Search Bar (តែមួយគត់ - បង្ហាញទាំងលើ Mobile និង Desktop) */}
          <form 
            onSubmit={handleSearch} 
            className="flex-1 max-w-2xl relative group"
          >
            <input 
              type="text" 
              placeholder="ស្វែងរកផលិតផល..." 
              className="w-full py-2.5 md:py-3 px-5 md:px-6 pr-12 rounded-2xl text-slate-800 text-sm md:text-base outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all shadow-lg font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button 
              type="submit" 
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Search size={20} />
            </button>
          </form>

          {/* ៣. Icons សកម្មភាព */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link to="/cart" className="relative p-2.5 hover:bg-white/10 rounded-2xl transition-all group">
              <ShoppingCart size={26} className="group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black h-5 w-5 rounded-full flex items-center justify-center border-2 border-blue-600 shadow-lg animate-bounce">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* របារប្រភេទផលិតផល (Sub-Navbar) */}
      <div className="bg-white border-b border-slate-100 overflow-x-auto no-scrollbar shadow-sm">
        <div className="container mx-auto px-4 flex items-center justify-start md:justify-center gap-2 md:gap-4 h-14">
          {categories.map((cat, index) => (
            <Link 
              key={index} 
              to={cat.path} 
              className="flex items-center gap-2 px-4 py-2 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white whitespace-nowrap text-[12px] md:text-[13px] font-black uppercase tracking-wider transition-all border border-slate-100 active:scale-95"
            >
              <span className="opacity-70">{cat.icon}</span>
              {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
};

export default Navbar;