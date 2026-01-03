import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Search, Home, Smartphone, Laptop, Headphones, Menu } from 'lucide-react';
import { useCart } from '../context/CartContext';

const Navbar = () => {
  const { totalItems } = useCart();

  // បញ្ជីប្រភេទផលិតផល
  const categories = [
    { name: 'ទាំងអស់', icon: <Home size={18} />, path: '/' },
    { name: 'ទូរស័ព្ទ', icon: <Smartphone size={18} />, path: '/category/phone' },
    { name: 'កុំព្យូទ័រ', icon: <Laptop size={18} />, path: '/category/laptop' },
    { name: 'គ្រឿងបន្លាស់', icon: <Headphones size={18} />, path: '/category/accessories' },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-sm">
      {/* របារខាងលើ (Main Navbar) */}
      <nav className="bg-blue-600 text-white border-b border-blue-500">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-black tracking-tighter shrink-0">
            24 STORE
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl relative group hidden sm:block">
            <input 
              type="text" 
              placeholder="ស្វែងរកផលិតផលនៅទីនេះ..." 
              className="w-full py-2 px-5 pr-12 rounded-full text-black text-sm outline-none focus:ring-2 focus:ring-yellow-400 transition-all shadow-inner"
            />
            <Search className="absolute right-4 top-2 text-gray-400" size={20} />
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-2 md:gap-5">
            <Link to="/" className="p-2 hover:bg-blue-700 rounded-full transition">
              <Home size={24} />
            </Link>
            <Link to="/cart" className="relative p-2 hover:bg-blue-700 rounded-full transition">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-blue-600 animate-pulse">
                  {totalItems}
                </span>
              )}
            </Link>
            <button className="sm:hidden p-2 hover:bg-blue-700 rounded-full">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* របារប្រភេទផលិតផល (Categories Bar) */}
      <div className="bg-white border-b overflow-x-auto no-scrollbar">
      <div className="container mx-auto px-4 flex items-center justify-center gap-4 h-12">
        {categories.map((cat, index) => (
          <Link 
            key={index} 
            to={cat.path} 
            className="
              flex items-center gap-2
              px-3 py-1.5
              border border-blue-500 text-blue-500
              rounded
              hover:bg-blue-500 hover:text-white
              whitespace-nowrap text-sm font-medium
              transition
            "
          >
            <span className="transition-colors">
              {cat.icon}
            </span>
            {cat.name}
          </Link>
        ))}
      </div>
    </div>
    </header>
  );
};

export default Navbar;