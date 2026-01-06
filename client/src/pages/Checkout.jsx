import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { 
  Send, ChevronLeft, ShieldCheck, MapPin, Phone, User, 
  ShoppingBag, Truck, Wallet, Banknote, Loader2, ImageIcon, 
  ChevronDown, Info, HelpCircle, PackagePlus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import qrImage from '../assets/QR/KB_QR.PNG'; // ប្រើរូបភាព QR ដូច ProductDetail

const Checkout = () => {
  const { cartItems, totalItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [payslip, setPayslip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const shippingCompanies = [
    { id: 'jt', name: 'J&T Express' },
    { id: 'vireak', name: 'Virak Buntham' },
    { id: 'larryta', name: 'Larryta Express' },
    { id: 'capito', name: 'Capito Express' },
    { id: 'taxi', name: 'ឡានឈ្នួល / ផ្ញើតាមឡាន' },
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

  useEffect(() => {
    if (formData.locationType === 'តាមខេត្ត') {
      setFormData(prev => ({ ...prev, paymentMethod: 'បង់តាម ABA / វីង' }));
    } else {
      setFormData(prev => ({ ...prev, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (Cash)' }));
    }
  }, [formData.locationType]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayslip(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (formData.paymentMethod === 'បង់តាម ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់!");
      return;
    }
    setShowConfirmModal(true);
  };

  const handleFinalCheckout = async () => {
    setLoading(true);
    setShowConfirmModal(false);

    let shippingInfo = formData.locationType;
    if (formData.locationType === 'តាមខេត្ត') {
      if (formData.shippingCompany === 'ឡានឈ្នួល / ផ្ញើតាមឡាន') {
        shippingInfo += ` (ឡាន: ${formData.taxiPlate}, បេន: ${formData.taxiStation}, ទូរស័ព្ទ: ${formData.taxiPhone})`;
      } else {
        shippingInfo += ` (${formData.shippingCompany})`;
      }
    }

    const orderPayload = new FormData();
    orderPayload.append('customerName', formData.name);
    orderPayload.append('customerPhone', formData.phone);
    orderPayload.append('customerAddress', formData.address);
    orderPayload.append('location', shippingInfo);
    orderPayload.append('paymentMethod', formData.paymentMethod);
    orderPayload.append('productName', cartItems.map(i => `${i.name} (x${i.quantity})`).join(', '));
    orderPayload.append('qty', totalItems);
    orderPayload.append('total', finalTotal.toFixed(2));
    if (payslip) orderPayload.append('payslip', payslip);

    try {
      const response = await fetch(`${API_URL}/api/orders`, { method: 'POST', body: orderPayload });
      if (response.ok) {
        const orderSummary = {
          id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
          customerName: formData.name,
          phone: formData.phone,
          address: `${formData.address} (${shippingInfo})`,
          productName: cartItems.map(i => i.name).join(' + '),
          qty: totalItems,
          total: finalTotal.toFixed(2),
          payslip: previewUrl
        };
        clearCart();
        navigate('/success', { state: { order: orderSummary } });
      }
    } catch (error) {
      alert("❌ មានបញ្ហាបច្ចេកទេស!");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#F8FAFC] gap-6 px-4 text-center">
      <div className="w-24 h-24 bg-white rounded-[2rem] shadow-xl flex items-center justify-center text-slate-300">
        <ShoppingBag size={48} />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-800 uppercase italic">កន្ត្រកទំនេរបញ្ច្រាស</h2>
        <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">មិនទាន់មានទំនិញក្នុងកន្ត្រកនៅឡើយទេ</p>
      </div>
      <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black uppercase italic shadow-lg shadow-blue-100 active:scale-95 transition-all">ទៅទិញឥឡូវនេះ</button>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header ដូច ProductDetail */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><ChevronLeft size={24} /></button>
        <span className="font-black text-slate-800 uppercase italic tracking-tight">Checkout Order</span>
        <div className="w-10"></div>
      </header>

      <main className="container mx-auto p-4 lg:p-10 max-w-2xl">
        <div className="bg-white p-8 lg:p-12 rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl border border-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-0 opacity-50"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-blue-600 rounded-[1.2rem] text-white shadow-xl shadow-blue-100 rotate-3"><ShieldCheck size={28} /></div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-none">Review & Pay</h2>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">ដឹកជញ្ជូន និងការទូទាត់</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmitAttempt} className="space-y-8">
              {/* ព័ត៌មានអតិថិជន */}
              <div className="grid grid-cols-1 gap-4">
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="text" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" placeholder="ឈ្មោះអ្នកទទួល" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="tel" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" placeholder="លេខទូរស័ព្ទ" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea required rows="2" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 resize-none border border-transparent focus:bg-white transition-all shadow-inner" placeholder="អាសយដ្ឋានលម្អិត (ផ្ទះ/ផ្លូវ/ភូមិ...)" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
              </div>

              {/* រើសតំបន់ */}
              <div className="space-y-3">
                <label className="text-[11px] font-black text-yellow-600 uppercase tracking-widest ml-1">តំបន់ដឹកជញ្ជូន</label>
                <div className="grid grid-cols-2 gap-3">
                  {['ភ្នំពេញ', 'តាមខេត្ត'].map((type) => (
                    <button key={type} type="button" onClick={() => setFormData({...formData, locationType: type})} className={`flex items-center justify-center gap-3 p-5 rounded-2xl border-2 transition-all font-black uppercase italic text-xs ${formData.locationType === type ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-50 bg-white text-slate-400'}`}>
                      {type === 'ភ្នំពេញ' ? <Truck size={18}/> : <MapPin size={18}/>} {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* ជម្រើសក្រុមហ៊ុនដឹកជញ្ជូន */}
              {formData.locationType === 'តាមខេត្ត' && (
                <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in zoom-in duration-300">
                  <label className="text-[13px] font-black text-yellow-600 uppercase tracking-widest ml-1">
                    ជ្រើសរើសក្រុមហ៊ុន ឬ តាក់ស៊ី
                  </label>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {shippingCompanies.map((company) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, shippingCompany: company.name })}
                        className={`py-3 px-2 rounded-xl border-2 font-black text-[11px] uppercase transition-all ${
                          formData.shippingCompany === company.name
                            ? 'border-blue-600 bg-white text-blue-600 shadow-sm'
                            : 'border-transparent bg-slate-200/50 text-slate-400'
                        }`}
                      >
                        {company.name}
                      </button>
                    ))}
                  </div>

                  {/* បង្ហាញ Input បន្ថែមបើជ្រើសរើស ឡានតាក់ស៊ី */}
                  {formData.shippingCompany === 'ឡានឈ្នួល / ផ្ញើតាមឡាន' && (
                    <div className="space-y-3 pt-3 border-t border-slate-200 animate-in fade-in duration-300">
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          required
                          placeholder="ស្លាកលេខឡាន"
                          className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none shadow-sm focus:border-blue-500"
                          value={formData.taxiPlate}
                          onChange={(e) => setFormData({ ...formData, taxiPlate: e.target.value })}
                        />
                        <input
                          required
                          placeholder="លេខទូរស័ព្ទឡាន"
                          className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none shadow-sm focus:border-blue-500"
                          value={formData.taxiPhone}
                          onChange={(e) => setFormData({ ...formData, taxiPhone: e.target.value })}
                        />
                      </div>
                      <input
                        required
                        placeholder="ទីតាំងចំណតឡាន"
                        className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none shadow-sm focus:border-blue-500"
                        value={formData.taxiStation}
                        onChange={(e) => setFormData({ ...formData, taxiStation: e.target.value })}
                      />
                    </div>
                  )}

                  {/* QR Payment Area (ដូច ProductDetail) */}
                  <div className="bg-blue-600 p-8 rounded-[2rem] text-white text-center shadow-xl relative overflow-hidden mt-4">
                    <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                    <div className="bg-white p-3 rounded-3xl inline-block mb-4 shadow-2xl">
                      <img src={qrImage} className="w-40 h-auto rounded-xl" alt="ABA QR" />
                    </div>
                    <p className="font-black text-xl italic uppercase tracking-widest">Payment KHQR</p>
                    <p className="text-sm opacity-75 mt-1">ABA: 000 777 111</p>
                  </div>

                  {/* Upload Payslip */}
                  <label className="block p-6 border-4 border-dashed border-blue-100 rounded-[2rem] text-center cursor-pointer bg-white hover:bg-blue-50 transition-all group mt-4">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {previewUrl ? (
                      <img src={previewUrl} className="h-44 mx-auto rounded-2xl object-cover shadow-2xl border-4 border-white" alt="preview" />
                    ) : (
                      <div className="text-red-500 flex flex-col items-center gap-2 font-black text-[13px] uppercase italic">
                        <ImageIcon size={28} />
                        សូមអាប់ឡូតរូបភាពវិក្កយបត្រ
                      </div>
                    )}
                  </label>
                </div>
              )}
              {/* សង្ខេបការបញ្ជាទិញ */}
              <div className="bg-neutral-950 p-8 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-yellow-400">
                <div className="max-h-40 overflow-y-auto space-y-3 mb-5 scrollbar-hide">
                  {cartItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-[13px] font-black uppercase tracking-tight italic opacity-70">
                      <span>{item.name} <span className="text-blue-400">x{item.quantity}</span></span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-[11px] font-black opacity-40 uppercase tracking-[0.2em] pt-4 border-t border-white/10">
                  <span>សេវាដឹក ({formData.locationType})</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-4 flex justify-between items-center">
                  <span className="font-black uppercase italic text-sm text-yellow-500">សរុបចុងក្រោយ:</span>
                  <span className="text-4xl font-black text-blue-400 tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-6 rounded-[2rem] font-black text-xl text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] disabled:bg-slate-300 flex items-center justify-center gap-4 active:scale-95 uppercase italic tracking-widest">
                {loading ? <Loader2 className="animate-spin" /> : <><Send size={24} className="-rotate-12" /> បញ្ជាក់ការកុម្ម៉ង់</>}
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Confirmation Modal ដូច ProductDetail */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-300 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2">តើបងប្រាកដទេ?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed italic">សូមពិនិត្យមើលព័ត៌មាន និងចំនួនទំនិញឱ្យបានត្រឹមត្រូវ មុនពេលចុចបញ្ជូន។</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleFinalCheckout} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all uppercase italic">បាទ/ចាស ប្រាកដហើយ</button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full bg-slate-100 text-slate-400 py-5 rounded-2xl font-black text-lg active:scale-95 transition-all uppercase italic">ត្រឡប់ក្រោយ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;