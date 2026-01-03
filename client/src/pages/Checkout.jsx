import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Send, ArrowLeft, ShieldCheck, MapPin, Phone, User, 
  ShoppingBag, Truck, CreditCard, Wallet, Banknote 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const { cartItems, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const deliveryOptions = [
    { id: 'express', label: 'ភ្នំពេញ (Express)', price: 1.5, icon: <Truck size={18}/> },
    { id: 'province', label: 'តាមខេត្ត (J&T/Vireak)', price: 2.5, icon: <MapPin size={18}/> }
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    deliveryMethod: deliveryOptions[0], 
    paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (Cash)'
  });

  const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = formData.deliveryMethod.price;
  const finalTotal = subTotal + deliveryFee;

  // --- មុខងារផ្ញើទិន្នន័យ (កែសម្រួលដើម្បីបាត់ CORS) ---
  const sendToTelegram = async (e) => {
    e.preventDefault();
    setLoading(true);

    let itemDetails = cartItems.map(item => `🔹 ${item.name}\n   $${item.price} x ${item.quantity}`).join('\n\n');
    
    // រៀបចំសារជា HTML (ឱ្យត្រូវជាមួយ parse_mode: 'HTML' ក្នុង Server)
    const message = `
<b>📦 មានការកុម្ម៉ង់ថ្មីពី 24 STORE</b>
━━━━━━━━━━━━━━━━━━
👤 <b>អតិថិជន:</b> ${formData.name}
📞 <b>លេខទូរស័ព្ទ:</b> ${formData.phone}
📍 <b>អាសយដ្ឋាន:</b> ${formData.address}
━━━━━━━━━━━━━━━━━━
🚚 <b>សេវាដឹក:</b> ${formData.deliveryMethod.label} ($${deliveryFee})
💳 <b>បង់ប្រាក់:</b> ${formData.paymentMethod}
━━━━━━━━━━━━━━━━━━
🛒 <b>បញ្ជីទំនិញ:</b>
${itemDetails}

💵 <b>តម្លៃទំនិញ:</b> $${subTotal.toLocaleString()}
🚚 <b>ថ្លៃដឹក:</b> $${deliveryFee}
💰 <b>សរុបរួម:</b> $${finalTotal.toLocaleString()}
━━━━━━━━━━━━━━━━━━
⏰ ថ្ងៃទី: ${new Date().toLocaleString('km-KH')}
    `;

    try {
      // ១. ផ្ញើសារទៅ Telegram តាមរយៈ Server (ដោះស្រាយ CORS)
      const telRes = await fetch('http://localhost:5000/api/send-telegram', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message }),
      });

      // ២. រក្សាទុក Order ចូលក្នុង System (orders.json) និងកាត់ស្តុក
      const orderRes = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.name,
          customerPhone: formData.phone,
          customerAddress: formData.address,
          productName: cartItems.map(i => `${i.name} (x${i.quantity})`).join(', '),
          total: finalTotal,
          deliveryMethod: formData.deliveryMethod.label,
          paymentMethod: formData.paymentMethod,
          qty: totalItems // បញ្ជូនចំនួនសរុបដើម្បីកាត់ស្តុក
        }),
      });

      if (telRes.ok && orderRes.ok) {
        alert("🎉 ការកុម្ម៉ង់ជោគជ័យ! តម្លៃសរុបគឺ: $" + finalTotal);
        clearCart();
        navigate('/');
      } else {
        throw new Error("ការផ្ញើមានបញ្ហា!");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("❌ បរាជ័យក្នុងការផ្ញើ! សូមពិនិត្យមើល Connection របស់ Server បង។");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return <div className="text-center py-20 font-bold">កន្ត្រកទទេ!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-blue-600 transition-colors">
          <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-blue-50"><ArrowLeft size={20} /></div>
          ត្រឡប់ក្រោយ
        </button>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl border border-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg"><ShieldCheck size={28} /></div>
            <div>
              <h2 className="text-2xl font-black text-slate-800 uppercase italic">Checkout</h2>
              <p className="text-slate-400 text-sm font-medium">គណនាតម្លៃ និងដឹកជញ្ជូន</p>
            </div>
          </div>
          
          <form onSubmit={sendToTelegram} className="space-y-6">
            <div className="space-y-4">
               <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500" placeholder="ឈ្មោះពេញ" onChange={(e) => setFormData({...formData, name: e.target.value})} />
               <input required type="tel" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500" placeholder="លេខទូរស័ព្ទ" onChange={(e) => setFormData({...formData, phone: e.target.value})} />
               <textarea required rows="2" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold focus:ring-2 focus:ring-blue-500" placeholder="អាសយដ្ឋាន" onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">សេវាដឹកជញ្ជូន</label>
              <div className="grid grid-cols-2 gap-3">
                {deliveryOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setFormData({...formData, deliveryMethod: option})}
                    className={`flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 transition-all font-bold ${
                      formData.deliveryMethod.id === option.id ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {option.icon}
                    <span className="text-xs">{option.label}</span>
                    <span className="text-[10px] opacity-70">${option.price}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">វិធីសាស្ត្របង់ប្រាក់</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'cash', label: 'បង់ប្រាក់ផ្ទាល់ (Cash)', icon: <Banknote size={18}/> },
                  { id: 'aba', label: 'បង់តាម ABA / វីង', icon: <Wallet size={18}/> }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setFormData({...formData, paymentMethod: item.label})}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-sm ${
                      formData.paymentMethod === item.label ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-xl mt-8 space-y-3">
              <div className="flex justify-between text-xs font-bold opacity-60 uppercase tracking-widest">
                <span>តម្លៃទំនិញ</span>
                <span>${subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs font-bold opacity-60 uppercase tracking-widest">
                <span>ថ្លៃដឹកជញ្ជូន</span>
                <span>${deliveryFee.toLocaleString()}</span>
              </div>
              <div className="pt-3 border-t border-white/10 flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400">សរុបរួម</p>
                  <h3 className="text-3xl font-black">${finalTotal.toLocaleString()}</h3>
                </div>
                <ShoppingBag size={28} className="text-white/20 mb-1" />
              </div>
            </div>

            <button disabled={loading} type="submit" className={`w-full py-5 rounded-[1.5rem] font-black text-lg text-white flex items-center justify-center gap-3 transition-all active:scale-95 shadow-xl ${loading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'}`}>
              {loading ? "កំពុងផ្ញើ..." : <><Send size={22} className="-rotate-12" /> បញ្ជាក់ការកុម្ម៉ង់</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;