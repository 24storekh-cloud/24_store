import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingCart, Search, User, Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const { totalItems } = useCart();
  const location = useLocation();

  // Function សម្រាប់ឆែកថា តើ Page ណាដែលកំពុង Active
  const isActive = (path) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-2 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-between items-center">
        
        {/* Home */}
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[10px] font-medium">ទំព័រដើម</span>
        </Link>

        {/* Search */}
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/search') ? 'text-blue-600' : 'text-gray-400'}`}>
          <Search size={22} strokeWidth={2} />
          <span className="text-[10px] font-medium">ស្វែងរក</span>
        </Link>

        {/* Cart */}
        <Link to="/cart" className={`relative flex flex-col items-center gap-1 ${isActive('/cart') ? 'text-blue-600' : 'text-gray-400'}`}>
          <div className="relative">
            <ShoppingCart size={22} strokeWidth={isActive('/cart') ? 2.5 : 2} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">កន្ត្រក</span>
        </Link>

        {/* Wishlist/Heart */}
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400">
          <Heart size={22} />
          <span className="text-[10px] font-medium">សំណព្វ</span>
        </Link>

        {/* Profile */}
        <Link to="/" className="flex flex-col items-center gap-1 text-gray-400">
          <User size={22} />
          <span className="text-[10px] font-medium">គណនី</span>
        </Link>

      </div>
    </div>
  );
};

export default BottomNav;