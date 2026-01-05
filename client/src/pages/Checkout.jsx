import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Send, ArrowLeft, ShieldCheck, MapPin, Phone, User, 
  ShoppingBag, Truck, Wallet, Banknote, Loader2, ImageIcon, ChevronDown, Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';

const Checkout = () => {
  const { cartItems, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const shippingCompanies = [
    { id: 'jt', name: 'J&T Express' },
    { id: 'vireak', name: 'Virak Buntham' },
    { id: 'taxi', name: 'ឡានឈ្នួល / ផ្ញើតាមឡាន' },
    { id: 'larryta', name: 'Larryta Express' },
    { id: 'vet', name: 'VET (Vireak Buntham Truck)' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    locationType: 'ភ្នំពេញ',
    shippingCompany: shippingCompanies[0].name,
    taxiPlate: '',
    taxiStation: '',
    taxiPhone: '',
    paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (Cash)'
  });

  const deliveryFee = formData.locationType === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const finalTotal = subTotal + deliveryFee;

  // ប្តូរ Payment Method អូតូតាមតំបន់
  useEffect(() => {
    if (formData.locationType === 'តាមខេត្ត') {
      setFormData(prev => ({ ...prev, paymentMethod: 'បង់តាម ABA / វីង' }));
    } else {
      setFormData(prev => ({ ...prev, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (Cash)' }));
    }
  }, [formData.locationType]);

  // សម្អាត URL រូបភាពពេល Component លែងប្រើ
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayslip(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (formData.paymentMethod === 'បង់តាម ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់!");
      return;
    }

    setLoading(true);
    const orderData = new FormData();
    orderData.append('customerName', formData.name);
    orderData.append('customerPhone', formData.phone);
    orderData.append('customerAddress', formData.address);
    
    let shippingInfo = formData.locationType;
    if (formData.locationType === 'តាមខេត្ត') {
      if (formData.shippingCompany === 'ឡានឈ្នួល / ផ្ញើតាមឡាន') {
        shippingInfo += ` (ឡានឈ្នួល: ${formData.taxiPlate}, ចំណត: ${formData.taxiStation}, ទូរស័ព្ទឡាន: ${formData.taxiPhone})`;
      } else {
        shippingInfo += ` (${formData.shippingCompany})`;
      }
    }
    orderData.append('location', shippingInfo);
    orderData.append('paymentMethod', formData.paymentMethod);
    orderData.append('productName', cartItems.map(i => `${i.name} (x${i.quantity})`).join(', '));
    orderData.append('qty', totalItems);
    orderData.append('total', finalTotal.toFixed(2));
    if (payslip) orderData.append('payslip', payslip);

    try {
      const response = await fetch(`${API_URL}/api/orders`, { method: 'POST', body: orderData });
      if (response.ok) {
        alert("🎉 ការកុម្ម៉ង់ជោគជ័យ! អរគុណសម្រាប់ការគាំទ្រ។");
        clearCart();
        navigate('/');
      }
    } catch (error) {
      alert("❌ មានបញ្ហាបច្ចេកទេស! សូមព្យាយាមម្តងទៀត។");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <ShoppingBag size={64} className="text-slate-300" />
      <p className="font-bold text-slate-500">មិនមានទំនិញក្នុងកន្ត្រកទេ</p>
      <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-xl font-bold">ទៅទិញឥឡូវនេះ</button>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-2xl">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-blue-600 transition-colors">
          <ArrowLeft size={20} /> ត្រឡប់ក្រោយ
        </button>

        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-white">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-4 bg-blue-600 rounded-2xl text-white shadow-lg"><ShieldCheck size={28} /></div>
            <div>
              <h2 className="text-xl font-black text-slate-800 uppercase italic">Checkout</h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Shipping Details</p>
            </div>
          </div>
          
          <form onSubmit={handleCheckout} className="space-y-6">
            {/* ព័ត៌មានអតិថិជន */}
            <div className="space-y-3">
               <input required type="text" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent" placeholder="ឈ្មោះពេញរបស់អ្នក" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
               <input required type="tel" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent" placeholder="លេខទូរស័ព្ទរបស់អ្នក" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
               <textarea required rows="2" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 resize-none border border-transparent" placeholder="អាសយដ្ឋានលម្អិត (ផ្ទះ/ផ្លូវ/ខេត្ត)" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
            </div>

            {/* រើសតំបន់ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">តំបន់ដឹកជញ្ជូន</label>
              <div className="grid grid-cols-2 gap-3">
                {['ភ្នំពេញ', 'តាមខេត្ត'].map((type) => (
                  <button key={type} type="button" onClick={() => setFormData({...formData, locationType: type})} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-xs ${formData.locationType === type ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' : 'border-slate-100 text-slate-500 hover:bg-slate-50'}`}>
                    {type === 'ភ្នំពេញ' ? <Truck size={16}/> : <MapPin size={16}/>} {type}
                  </button>
                ))}
              </div>
            </div>

            {/* ជម្រើសក្រុមហ៊ុនដឹកជញ្ជូន */}
            {formData.locationType === 'តាមខេត្ត' && (
              <div className="space-y-4 animate-in slide-in-from-top duration-300">
                <div className="relative">
                  <select 
                    className="w-full p-4 bg-white border-2 border-slate-100 rounded-2xl outline-none font-bold text-sm appearance-none focus:border-blue-500"
                    value={formData.shippingCompany}
                    onChange={(e) => setFormData({...formData, shippingCompany: e.target.value})}
                  >
                    {shippingCompanies.map(company => (
                      <option key={company.id} value={company.name}>{company.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>

                {formData.shippingCompany === 'ឡានឈ្នួល / ផ្ញើតាមឡាន' && (
                  <div className="p-5 bg-blue-50/50 rounded-3xl border border-blue-100 space-y-3">
                    <div className="flex items-center gap-2 text-blue-600 mb-2 font-black text-[10px] uppercase">
                      <Info size={14} /> ព័ត៌មានឡានឈ្នួល
                    </div>
                    <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold shadow-sm" placeholder="លេខឡាន ឬ ស្លាកលេខ" value={formData.taxiPlate} onChange={(e) => setFormData({...formData, taxiPlate: e.target.value})} />
                    <input required type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold shadow-sm" placeholder="ទីតាំងចំណតឡាន" value={formData.taxiStation} onChange={(e) => setFormData({...formData, taxiStation: e.target.value})} />
                    <input required type="tel" className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none text-sm font-bold shadow-sm" placeholder="លេខទូរស័ព្ទឡាន" value={formData.taxiPhone} onChange={(e) => setFormData({...formData, taxiPhone: e.target.value})} />
                  </div>
                )}
              </div>
            )}

            {/* វិធីសាស្ត្របង់ប្រាក់ */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">វិធីសាស្ត្របង់ប្រាក់</label>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" disabled={formData.locationType === 'តាមខេត្ត'} onClick={() => setFormData({...formData, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (Cash)'})} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-[11px] ${formData.paymentMethod === 'បង់ប្រាក់ផ្ទាល់ (Cash)' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 opacity-50'}`}>
                  <Banknote size={18}/> បង់ពេលដល់
                </button>
                <button type="button" onClick={() => setFormData({...formData, paymentMethod: 'បង់តាម ABA / វីង'})} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all font-bold text-[11px] ${formData.paymentMethod === 'បង់តាម ABA / វីង' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-500'}`}>
                  <Wallet size={18}/> បង់លុយមុន
                </button>
              </div>
            </div>

            {/* បង្ហាញ QR ពេលរើសបង់លុយមុន */}
            {formData.paymentMethod === 'បង់តាម ABA / វីង' && (
              <div className="space-y-4">
                <div className="bg-blue-600 p-6 rounded-[2rem] text-white text-center shadow-lg">
                  <div className="bg-white p-2 rounded-2xl inline-block mb-3">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABA_PAYMENT_ID" className="w-24 h-24" alt="QR" />
                  </div>
                  <p className="font-black text-xs uppercase italic tracking-widest">ABA: 000 000 000 | 24 STORE</p>
                  <p className="text-[10px] opacity-75">សរុបដែលត្រូវបង់: ${finalTotal.toFixed(2)}</p>
                </div>
                <label className="block p-4 border-2 border-dashed border-blue-200 rounded-2xl text-center cursor-pointer hover:bg-blue-50 transition-colors">
                  <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  {previewUrl ? <img src={previewUrl} className="h-32 mx-auto rounded-lg shadow-md" alt="slip" /> : (
                    <div className="text-blue-500 flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                      <ImageIcon size={24}/> អាប់ឡូតរូបភាពវិក្កយបត្រ
                    </div>
                  )}
                </label>
              </div>
            )}

            {/* សេចក្តីសង្ខេបការបញ្ជាទិញ */}
            <div className="bg-slate-900 p-6 rounded-[2rem] text-white shadow-2xl space-y-3">
              <div className="max-h-32 overflow-y-auto space-y-2 mb-3 scrollbar-hide">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] font-bold opacity-70">
                    <span>{item.name} (x{item.quantity})</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-bold opacity-50 uppercase tracking-widest pt-2 border-t border-white/10">
                <span>ថ្លៃដឹកជញ្ជូន ({formData.locationType})</span>
                <span>${deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 flex justify-between items-center">
                <span className="font-black uppercase italic text-sm">សរុបរួម:</span>
                <span className="text-3xl font-black text-blue-400">${finalTotal.toFixed(2)}</span>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-5 rounded-2xl font-black text-lg text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 disabled:bg-slate-400 flex items-center justify-center gap-3 active:scale-95">
              {loading ? <Loader2 className="animate-spin" /> : <><Send size={20} className="-rotate-12" /> បញ្ជាក់ការកុម្ម៉ង់</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Checkout;