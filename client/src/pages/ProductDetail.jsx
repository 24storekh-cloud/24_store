import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
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

  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && img.includes('localhost:5000')) {
      return img.replace('http://localhost:5000', API_URL);
    }
    if (typeof img === 'string' && !img.startsWith('http')) {
      return `${API_URL}/uploads/${img}`;
    }
    return img;
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`); 
        const data = await response.json();
        const foundProduct = data.products.find(p => p.id.toString() === id);
        setProduct(foundProduct);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
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

  const deliveryFee = orderForm.location === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = product ? product.price * orderForm.qty : 0;
  const finalTotal = subTotal + deliveryFee;

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (orderForm.paymentMethod === 'ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់របស់អ្នក!");
      return;
    }

    setIsSubmitting(true);
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
      const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', body: formData });
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: 'Markdown' })
      });

      if (payslip) {
        const teleFormData = new FormData();
        teleFormData.append('chat_id', chatId);
        teleFormData.append('photo', payslip);
        teleFormData.append('caption', `🧾 វិក្កយបត្រពី៖ ${orderForm.name}`);
        await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, { method: 'POST', body: teleFormData });
      }
      
      if (res.ok) {
        alert("🎉 ការកុម្ម៉ង់បានជោគជ័យ!");
        setShowOrderModal(false);
        navigate('/');
      }
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="text-blue-600 animate-spin mb-4" size={48} />
      <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Loading Details...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-10">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-md px-4 h-14 flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-800"><ChevronLeft size={28} /></button>
        <span className="ml-2 font-black text-slate-800 uppercase italic truncate">{product.name}</span>
      </div>

      <main className="container mx-auto lg:px-4 lg:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12 items-start">
          
          {/* Image Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="relative bg-white lg:rounded-[2.5rem] shadow-xl border-b lg:border border-white overflow-hidden aspect-square md:aspect-auto">
              <img 
                src={getImageUrl(productImages[activeImg])} 
                className="w-full h-full lg:h-[500px] object-cover" 
                alt=""
              />
              {productImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {productImages.map((_, i) => (
                    <div key={i} className={`h-1.5 rounded-full transition-all ${activeImg === i ? 'w-8 bg-blue-600' : 'w-2 bg-white/50'}`} />
                  ))}
                </div>
              )}
            </div>
            <div className="flex gap-3 overflow-x-auto pb-4 px-4 lg:px-0 scrollbar-hide">
              {productImages.map((img, index) => (
                <button key={index} onClick={() => setActiveImg(index)} className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border-2 transition-all ${activeImg === index ? 'border-blue-600 scale-105' : 'border-white shadow-sm'}`}>
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="px-6 py-6 lg:p-0 space-y-6">
            <div>
              <span className="bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter">New Arrival</span>
              <h1 className="text-3xl lg:text-4xl font-black text-slate-800 mt-3 leading-tight uppercase italic">{product.name}</h1>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-3xl font-black text-blue-600">${product.price}</span>
                <span className="text-slate-400 font-bold line-through text-sm">${(product.price * 1.2).toFixed(2)}</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-50">
              <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-widest">Product Details</h3>
              <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line font-medium">{product.detail || "No details available."}</p>
            </div>

            {/* Floating Mobile Button Container */}
            <div className="fixed lg:relative bottom-0 left-0 right-0 p-4 lg:p-0 bg-white lg:bg-transparent border-t lg:border-0 z-40">
                <button 
                onClick={() => setShowOrderModal(true)} 
                disabled={product.stock <= 0} 
                className={`w-full h-14 lg:h-16 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all active:scale-95 ${product.stock > 0 ? 'bg-blue-600 text-white shadow-xl' : 'bg-slate-200 text-slate-400'}`}
                >
                <ShoppingCart size={22} /> {product.stock > 0 ? 'កុម្ម៉ង់ឥឡូវនេះ' : 'ទំនិញអស់ស្តុក'}
                </button>
            </div>
          </div>
        </div>
      </main>

      {/* Order Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] lg:rounded-[2.5rem] shadow-2xl relative overflow-hidden h-[90vh] lg:h-auto lg:max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
            <div className="sticky top-0 bg-white/90 backdrop-blur-md px-8 py-6 border-b border-slate-50 flex justify-between items-center z-20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white"><PackagePlus size={20}/></div>
                <h3 className="text-xl font-black text-slate-800 uppercase italic">Checkout</h3>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-2 bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleOrderSubmit} className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" placeholder="ឈ្មោះអ្នកទទួល" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                </div>
                <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input required type="text" placeholder="លេខទូរស័ព្ទ" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 transition-all" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                </div>
                <div className="relative">
                    <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                    <textarea required placeholder="អាសយដ្ឋានលម្អិត (ផ្ទះលេខ/ផ្លូវ...)" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24 focus:ring-2 focus:ring-blue-500 transition-all" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}></textarea>
                </div>
                
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">តំបន់ និងសេវាដឹក</p>
                    <div className="grid grid-cols-2 gap-3">
                        {['ភ្នំពេញ', 'តាមខេត្ត'].map(loc => (
                        <button key={loc} type="button" onClick={() => setOrderForm({...orderForm, location: loc})} className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 font-black text-xs transition-all ${orderForm.location === loc ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' : 'border-slate-100 text-slate-400'}`}>
                            <Truck size={16} /> {loc}
                        </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">វិធីសាស្ត្របង់ប្រាក់</p>
                    <div className="grid grid-cols-2 gap-3">
                        <button type="button" disabled={orderForm.location === 'តាមខេត្ត'} onClick={() => setOrderForm({...orderForm, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (COD)'})} className={`p-4 rounded-2xl border-2 font-black text-[10px] transition-all ${orderForm.paymentMethod === 'បង់ប្រាក់ផ្ទាល់ (COD)' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 disabled:opacity-30'}`}>
                            បង់ពេលអីវ៉ាន់ដល់
                        </button>
                        <button type="button" onClick={() => setOrderForm({...orderForm, paymentMethod: 'ABA / វីង'})} className={`p-4 rounded-2xl border-2 font-black text-[10px] transition-all ${orderForm.paymentMethod === 'ABA / វីង' ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100' : 'border-slate-100 text-slate-400'}`}>
                            ABA / វីង
                        </button>
                    </div>
                </div>

                {orderForm.paymentMethod === 'ABA / វីង' && (
                  <div className="animate-in fade-in zoom-in duration-500 space-y-4">
                    <div className="bg-blue-600 p-6 rounded-[2.5rem] text-white text-center shadow-xl">
                      <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest mb-4">Scan QR to pay</p>
                      <div className="bg-white p-3 rounded-3xl inline-block shadow-inner mb-4">
                        <img src={`${API_URL}/uploads/QR/KB_QR.PNG`} className="w-40 h-40 object-contain" alt="QR" onError={(e) => { e.target.src = "https://placehold.co/200x200?text=QR+Not+Found"; }} />
                      </div>
                      <p className="font-black text-lg">24 STORE</p>
                      <p className="text-xs font-bold opacity-70">Pay: ${finalTotal.toFixed(2)}</p>
                    </div>

                    <label className="block p-4 bg-blue-50 rounded-2xl border-2 border-dashed border-blue-200 cursor-pointer text-center">
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                        {previewUrl ? (
                            <img src={previewUrl} className="w-full h-32 object-cover rounded-xl" alt="Slip" />
                        ) : (
                            <div className="flex flex-col items-center gap-1 text-blue-500">
                                <ImageIcon size={24} />
                                <span className="text-[10px] font-black uppercase">Upload Payslip</span>
                            </div>
                        )}
                    </label>
                  </div>
                )}
              </div>

              {/* Pricing Summary */}
              <div className="bg-slate-900 p-6 rounded-[2rem] text-white space-y-3 shadow-2xl">
                <div className="flex justify-between items-center text-xs font-bold opacity-60">
                    <span>ចំនួនកុម្ម៉ង់</span>
                    <div className="flex items-center gap-4 bg-white/10 px-3 py-1 rounded-full">
                        <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.max(1, orderForm.qty - 1)})} className="text-lg">-</button>
                        <span className="text-sm font-black text-blue-400">{orderForm.qty}</span>
                        <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.min(product.stock, orderForm.qty + 1)})} className="text-lg">+</button>
                    </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold">
                    <span className="opacity-60">សេវាដឹកជញ្ជូន</span>
                    <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                    <span className="font-black text-sm italic uppercase">សរុបរួម:</span>
                    <span className="text-2xl font-black text-blue-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 disabled:bg-slate-300">
                {isSubmitting ? "Processing..." : "Confirm My Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;