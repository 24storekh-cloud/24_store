import React from 'react';
import { useCart } from '../context/CartContext';
import { Trash2, Plus, Minus, ArrowLeft, ShoppingBag, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { cartItems, addToCart, removeFromCart, decreaseQuantity, totalItems } = useCart();

  // គណនាតម្លៃសរុប
  const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // ប្រសិនបើកន្ត្រកទទេ
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto py-24 px-4 text-center">
        <div className="bg-white p-10 rounded-3xl shadow-sm inline-block">
          <ShoppingBag size={80} className="mx-auto text-gray-200 mb-6" />
          <h2 className="text-2xl font-bold text-gray-800">កន្ត្រកទំនិញរបស់អ្នកទទេស្អាត!</h2>
          <p className="text-gray-500 mt-2 mb-8">សូមត្រឡប់ទៅជ្រើសរើសទំនិញដែលអ្នកស្រឡាញ់។</p>
          <Link to="/" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
            ទៅទិញទំនិញឥឡូវនេះ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingBag className="text-blue-600" /> កន្ត្រកទំនិញ ({totalItems})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* បញ្ជីទំនិញ (ផ្នែកខាងឆ្វេង) */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white p-4 md:p-6 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100 hover:border-blue-200 transition">
                {/* រូបភាពផលិតផលគំរូ */}
                <div className="w-20 h-20 md:w-28 md:h-28 bg-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                  <img src={item.image || "https://via.placeholder.com/150"} alt={item.name} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-800 text-base md:text-lg truncate">{item.name}</h3>
                  <p className="text-red-600 font-bold mt-1 text-lg">${item.price.toLocaleString()}</p>
                </div>

                {/* ផ្នែកគ្រប់គ្រងចំនួន */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl border p-1">
                    <button 
                      onClick={() => decreaseQuantity(item.id)}
                      className="p-1 md:p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition"
                    >
                      <Minus size={18} />
                    </button>
                    <span className="font-bold w-6 text-center text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => addToCart(item)} 
                      className="p-1 md:p-2 hover:bg-white hover:shadow-sm rounded-lg text-gray-600 transition"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="text-gray-400 hover:text-red-500 flex items-center gap-1 text-sm transition"
                  >
                    <Trash2 size={16} /> លុប
                  </button>
                </div>
              </div>
            ))}
            
            <Link to="/" className="inline-flex items-center gap-2 text-blue-600 font-bold mt-6 hover:gap-4 transition-all">
              <ArrowLeft size={20} /> បន្តទិញទំនិញបន្ថែម
            </Link>
          </div>

          {/* សេចក្តីសង្ខេបតម្លៃ (ផ្នែកខាងស្តាំ) */}
          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <CreditCard size={20} className="text-blue-600" /> សរុបការបញ្ជាទិញ
              </h2>
              
              <div className="space-y-4 border-b pb-6">
                <div className="flex justify-between text-gray-500">
                  <span>តម្លៃទំនិញសរុប</span>
                  <span className="font-semibold text-gray-800">${totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>សេវាដឹកជញ្ជូន</span>
                  <span className="text-green-600 font-bold">ឥតគិតថ្លៃ</span>
                </div>
              </div>

              <div className="py-6 flex justify-between items-center">
                <span className="text-lg font-bold text-gray-800">តម្លៃត្រូវបង់សរុប</span>
                <span className="text-3xl font-black text-red-600">${totalPrice.toLocaleString()}</span>
              </div>
              
              <Link 
                to="/checkout" 
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-100 transition active:scale-95"
              >
                បន្តទៅការទូទាត់ប្រាក់
              </Link>
              
              <p className="text-center text-gray-400 text-xs mt-4">
                ការទូទាត់នឹងត្រូវធ្វើឡើងតាមរយៈ Telegram
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;