import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_URL from '../apiConfig';
import toast from 'react-hot-toast';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, decreaseQuantity, totalItems } = useCart();

  // Helper សម្រាប់បង្ហាញរូបភាព
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/400x400?text=No+Image';
    let finalImg = Array.isArray(img) ? img[0] : img;
    if (finalImg.startsWith('data:')) return finalImg;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    return finalImg.startsWith('http') ? finalImg : `${baseUrl}/${finalImg.replace(/^\//, '')}`;
  };

  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // មុខងារបន្ថែមចំនួនទំនិញ (ជាមួយការឆែកស្តុក)
  const handleIncrease = async (item) => {
    try {
      // បាញ់ទៅ API ដើម្បីឆែក និងកាត់ស្តុកក្នុង data.json
      const res = await fetch(`${API_URL}/api/products/${item.id}/reduce-stock`, { method: 'PATCH' });
      const data = await res.json();
      
      if (data.success) {
        addToCart(item); // បន្ថែមក្នុង Context/Local State
      } else {
        toast.error("សុំទោស! ទំនិញនេះអស់ពីស្តុកហើយ។");
      }
    } catch (err) {
      toast.error("មានបញ្ហាបច្ចេកទេស!");
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <div className="bg-white p-10 rounded-[3rem] shadow-sm inline-block border border-gray-100">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={40} className="text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-800 uppercase italic">កន្ត្រកទំនិញទទេស្អាត!</h2>
          <p className="text-gray-500 mt-2 mb-8 font-medium">មិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេ</p>
          <Link to="/" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition shadow-xl shadow-blue-100 inline-block">
            ទៅទិញទំនិញឥឡូវនេះ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-black mb-10 flex items-center gap-4 text-slate-800 uppercase italic">
          <div className="p-3 bg-white rounded-2xl shadow-sm border">
            <ShoppingBag className="text-blue-600" size={24} />
          </div>
          កន្ត្រកទំនិញ <span className="text-blue-600">({totalItems})</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-5 rounded-[2.5rem] shadow-sm flex items-center gap-6 border border-white hover:border-blue-100 transition-all group">
                {/* រូបភាពផលិតផល */}
                <div className="w-24 h-24 md:w-32 md:h-32 bg-slate-50 rounded-[2rem] flex-shrink-0 overflow-hidden border">
                  <img 
                    src={getImageUrl(item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-slate-800 text-lg md:text-xl truncate uppercase italic">{item.name}</h3>
                  <p className="text-blue-600 font-black mt-1 text-xl tracking-tighter">
                    ${Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                </div>

                {/* ផ្នែកគ្រប់គ្រងចំនួន */}
                <div className="flex flex-col items-end gap-4">
                  <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-red-500 transition active:scale-90"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-black w-6 text-center text-lg text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => handleIncrease(item)} 
                      className="w-10 h-10 flex items-center justify-center bg-white rounded-xl shadow-sm hover:text-blue-600 transition active:scale-90"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-red-500 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition"
                  >
                    <Trash2 size={14} /> លុបទំនិញ
                  </button>
                </div>
              </div>
            ))}
            
            <Link to="/" className="inline-flex items-center gap-3 text-slate-400 font-black text-[10px] uppercase tracking-[0.2em] mt-8 hover:text-blue-600 transition-all">
              <ArrowLeft size={18} /> បន្តទិញទំនិញបន្ថែម
            </Link>
          </div>

          {/* សេចក្តីសង្ខេបតម្លៃ */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-8 rounded-[3rem] shadow-xl shadow-blue-900/5 border border-white">
              <h2 className="text-xl font-black mb-8 flex items-center gap-3 text-slate-800 uppercase italic">
                <CreditCard size={22} className="text-blue-600" /> Summary
              </h2>
              
              <div className="space-y-5 border-b border-slate-50 pb-8">
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>SUBTOTAL</span>
                  <span className="text-slate-800">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-slate-500 font-bold text-sm">
                  <span>SHIPPING</span>
                  <span className="text-green-500 font-black">FREE</span>
                </div>
              </div>

              <div className="py-8 flex justify-between items-center">
                <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Price</span>
                <span className="text-4xl font-black text-blue-600 tracking-tighter italic">${totalPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              
              <Link 
                to="/checkout" 
                className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-blue-600 shadow-2xl transition-all active:scale-95 mb-4"
              >
                Checkout Now
              </Link>
              
              <p className="text-center text-slate-400 text-[9px] font-bold uppercase tracking-widest leading-relaxed">
                Secure checkout via <br/><span className="text-blue-400">Telegram Notification</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;