import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ShoppingCart, Loader2, X, Phone, MapPin, 
  User, PackagePlus, ChevronRight, Send, Truck, CreditCard, Image as ImageIcon
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [activeImg, setActiveImg] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);

  // --- បន្ថែម State ថ្មីសម្រាប់ Payslip ---
  const [payslip, setPayslip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    qty: 1,
    location: 'ភ្នំពេញ',
    paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (COD)'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/data');
        const data = await res.json();
        const foundProduct = data.products.find(p => p.id.toString() === id);
        setProduct(foundProduct);
        setLoading(false);
      } catch (err) {
        console.error("Error:", err);
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (orderForm.location === 'តាមខេត្ត') {
      setOrderForm(prev => ({ ...prev, paymentMethod: 'ABA / វីង' }));
    }
  }, [orderForm.location]);

  // --- បន្ថែមមុខងារ Handle File Change ---
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayslip(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const productImages = product?.images || (product?.image ? [product.image] : []);

  const nextSlide = useCallback(() => {
    setActiveImg((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  }, [productImages.length]);

  const prevSlide = () => {
    setActiveImg((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  useEffect(() => {
    if (productImages.length > 1) {
      const interval = setInterval(() => { nextSlide(); }, 5000);
      return () => clearInterval(interval);
    }
  }, [nextSlide, productImages.length]);

  const deliveryFee = orderForm.location === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = product ? product.price * orderForm.qty : 0;
  const finalTotal = subTotal + deliveryFee;

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    
    // បើបង់តាម ABA តែមិនទាន់អាប់ឡូតរូប ត្រូវ Alert ប្រាប់
    if (orderForm.paymentMethod === 'ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់របស់អ្នក!");
      return;
    }

    setIsSubmitting(true);

    // រៀបចំ FormData ដើម្បីផ្ញើទាំង Text និង File ទៅ Server
    const formData = new FormData();
    formData.append('productId', product.id);
    formData.append('productName', product.name);
    formData.append('qty', orderForm.qty);
    formData.append('customerName', orderForm.name);
    formData.append('customerPhone', orderForm.phone);
    formData.append('customerAddress', orderForm.address);
    formData.append('location', orderForm.location);
    formData.append('paymentMethod', orderForm.paymentMethod);
    formData.append('deliveryFee', deliveryFee);
    formData.append('total', finalTotal);
    if (payslip) formData.append('payslip', payslip);

    const botToken = "8227092903:AAFpSAV1ZRr8WRLCD23wCHhS_3teAEN_1SI"; 
    const chatId = "7026983728"; 
    const message = `🌟 **ការកុម្ម៉ង់ថ្មី** 🌟\n👤 ឈ្មោះ: ${orderForm.name}\n📞 ទូរស័ព្ទ: ${orderForm.phone}\n📍 តំបន់: ${orderForm.location}\n🚚 អាសយដ្ឋាន: ${orderForm.address}\n📦 ទំនិញ: ${product.name} (x${orderForm.qty})\n💳 បង់តាម: ${orderForm.paymentMethod}\n💰 **សរុបរួម: $${finalTotal}**`;

    try {
      // ១. ផ្ញើទៅ API Server
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        body: formData // ផ្ញើជា FormData ជំនួស JSON
      });

      // ២. ផ្ញើទៅ Telegram (Text)
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
      });

      // ៣. ផ្ញើរូបភាព Payslip ទៅ Telegram បើមាន
      if (payslip) {
        const teleFormData = new FormData();
        teleFormData.append('chat_id', chatId);
        teleFormData.append('photo', payslip);
        teleFormData.append('caption', `🧾 វិក្កយបត្រពីអតិថិជន៖ ${orderForm.name}`);
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
          method: 'POST',
          body: teleFormData
        });
      }
      
      if (res.ok) {
        alert("🎉 ការកុម្ម៉ង់បានជោគជ័យ!");
        setShowOrderModal(false);
        navigate('/');
      }
    } catch (err) {
      alert("មានបញ្ហាភ្ជាប់ទៅកាន់ Server");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
      <p className="text-slate-500 font-bold uppercase tracking-widest">Loading Details...</p>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-bold">រកមិនឃើញផលិតផល!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-20 font-sans">
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-600 font-bold hover:text-blue-600 transition">
            <ChevronLeft size={24} /> ត្រលប់ក្រោយ
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-4 sticky top-24">
            <div className="relative group bg-white p-4 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
              <img src={productImages[activeImg]} alt={product.name} className="w-full h-[400px] md:h-[500px] rounded-[2rem] object-cover transition-all duration-700 ease-in-out" />
              {productImages.length > 1 && (
                <>
                  <button onClick={prevSlide} className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronLeft size={20} /></button>
                  <button onClick={nextSlide} className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-md p-3 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><ChevronRight size={20} /></button>
                </>
              )}
            </div>
            <div className="flex gap-4 overflow-x-auto pb-2 px-2 scrollbar-hide">
              {productImages.map((img, index) => (
                <button key={index} onClick={() => setActiveImg(index)} className={`relative flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-4 transition-all ${activeImg === index ? 'border-blue-600 scale-105' : 'border-white shadow-sm'}`}><img src={img} className="w-full h-full object-cover" alt="" /></button>
              ))}
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <span className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider">{product.category}</span>
              <h1 className="text-4xl font-black text-slate-800 mt-4 leading-tight">{product.name}</h1>
              <div className="text-3xl font-black text-blue-600 mt-4">${product.price}</div>
              <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
                 <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                 <span className="text-sm font-bold text-slate-600">{product.stock > 0 ? `មានក្នុងស្តុក៖ ${product.stock}` : "អស់ស្តុកហើយ"}</span>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 italic font-medium text-slate-600 leading-relaxed whitespace-pre-line">{product.detail || "មិនមានព័ត៌មានលម្អិត។"}</div>
            <button onClick={() => setShowOrderModal(true)} disabled={product.stock <= 0} className={`w-full h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${product.stock > 0 ? 'bg-blue-600 text-white shadow-xl hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><ShoppingCart size={24} /> {product.stock > 0 ? 'កុម្ម៉ង់ឥឡូវនេះ' : 'ទំនិញអស់ស្តុក'}</button>
          </div>
        </div>
      </main>

      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto">
            <button onClick={() => {setShowOrderModal(false); setPreviewUrl(null); setPayslip(null);}} className="absolute top-6 right-6 text-slate-400 hover:text-red-500 z-10"><X size={28} /></button>
            
            <form onSubmit={handleOrderSubmit} className="p-8 space-y-5">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg"><PackagePlus size={24}/></div>
                <h3 className="text-2xl font-black text-slate-800 italic uppercase">Checkout</h3>
              </div>
              
              <div className="space-y-4">
                <input required type="text" placeholder="ឈ្មោះអ្នកទទួល" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                <input required type="text" placeholder="លេខទូរស័ព្ទ" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                <textarea required placeholder="អាសយដ្ឋានដឹកជញ្ជូន" className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold h-20" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}></textarea>
                
                <h2 className="text-x font-black text-slate-800 uppercase tracking-widest">ការបង់ប្រាក់</h2>
                <div className="grid grid-cols-2 gap-3">
                  {['ភ្នំពេញ', 'តាមខេត្ត'].map(loc => (
                    <button key={loc} type="button" onClick={() => setOrderForm({...orderForm, location: loc})} className={`p-3 rounded-xl border-2 font-bold transition-all ${orderForm.location === loc ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                      {loc} (${loc === 'ភ្នំពេញ' ? '1.5' : '2.5'})
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button type="button" disabled={orderForm.location === 'តាមខេត្ត'} onClick={() => setOrderForm({...orderForm, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (COD)'})} className={`p-3 rounded-xl border-2 font-bold transition-all ${orderForm.paymentMethod === 'បង់ប្រាក់ផ្ទាល់ (COD)' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 disabled:opacity-30'}`}>
                    បង់ពេលអីវ៉ាន់ដល់
                  </button>
                  <button type="button" onClick={() => setOrderForm({...orderForm, paymentMethod: 'ABA / វីង'})} className={`p-3 rounded-xl border-2 font-bold transition-all ${orderForm.paymentMethod === 'ABA / វីង' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                    ABA / វីង
                  </button>
                </div>

                {orderForm.paymentMethod === 'ABA / វីង' && (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center bg-white p-6 rounded-[2.5rem] border-2 border-blue-600 shadow-xl shadow-blue-100 animate-in fade-in zoom-in duration-300">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="p-1.5 bg-blue-600 rounded-lg shadow-sm">
                          <CreditCard size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-black text-slate-800 uppercase italic tracking-tighter text-center">Scan to Pay Now<br/>ស្កេនដើម្បីបង់ប្រាក់</p>
                      </div>
                      
                      <div className="relative p-3 bg-white border-2 border-slate-50 rounded-[2rem] shadow-inner">
                        <img 
                          src="http://localhost:5000/uploads/QR/KB_QR.PNG" 
                          alt="ABA QR" 
                          className="w-48 h-48 rounded-xl object-contain" 
                          onError={(e) => { e.target.src = "https://via.placeholder.com/200?text=QR+Not+Found"; }}
                        />
                      </div>

                      <div className="mt-5 text-center w-full space-y-3">
                        <div>
                          <p className="text-[13px] font-black text-slate-400 uppercase">ឈ្មោះគណនី</p>
                          <p className="text-[18px] font-black text-blue-900 uppercase">24 STORE</p>
                        </div>
                        <div className="py-2 px-6 bg-slate-900 text-white rounded-xl text-center">
                          <p className="text-[10px] opacity-60 uppercase font-bold">ទឹកប្រាក់ត្រូវបង់</p>
                          <p className="text-xl font-black text-blue-400">${finalTotal.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    {/* --- ផ្នែក Upload Payslip UI --- */}
                    <div className="bg-blue-50 p-4 rounded-2xl border-2 border-dashed border-blue-200">
                      <p className="text-[10px] font-black text-blue-600 uppercase mb-3 text-center">សូមបញ្ជាក់ការបង់ប្រាក់ (Upload Payslip)</p>
                      <label className="flex flex-col items-center justify-center cursor-pointer">
                        {previewUrl ? (
                          <div className="relative w-full h-32">
                            <img src={previewUrl} className="w-full h-full object-cover rounded-xl border border-white" alt="Preview" />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                               <span className="text-white text-xs font-bold">ចុចដើម្បីប្តូររូប</span>
                            </div>
                          </div>
                        ) : (
                          <div className="py-4 flex flex-col items-center text-slate-400">
                            <ImageIcon size={32} />
                            <span className="text-[10px] font-bold mt-1">ចុចទីនេះដើម្បីដាក់រូបវិក្កយបត្រ</span>
                          </div>
                        )}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      </label>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl font-bold text-sm">
                  <span className="text-slate-500 uppercase">ចំនួន: {orderForm.qty}</span>
                  <div className="flex gap-4">
                    <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.max(1, orderForm.qty - 1)})} className="text-blue-600 text-xl font-black">-</button>
                    <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.min(product.stock, orderForm.qty + 1)})} className="text-blue-600 text-xl font-black">+</button>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-dashed">
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 uppercase">ទំនិញ</span>
                        <span className="text-slate-800">${subTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm font-bold">
                        <span className="text-slate-400 uppercase">សេវាដឹក</span>
                        <span className="text-slate-800">${deliveryFee.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t">
                        <span className="font-black text-slate-800 uppercase text-xs">សរុបរួម:</span>
                        <span className="text-2xl font-black text-blue-600">${finalTotal.toLocaleString()}</span>
                    </div>
                </div>
              </div>

              <button disabled={isSubmitting} className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg hover:bg-black transition-all shadow-xl disabled:bg-slate-300">
                {isSubmitting ? "កំពុងបញ្ជូន..." : "បញ្ជាក់ការកុម្ម៉ង់"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;