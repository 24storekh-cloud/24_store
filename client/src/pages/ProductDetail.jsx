import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import { 
  ChevronLeft, ShoppingCart, Loader2, X, Phone, MapPin, 
  User, PackagePlus, Truck, ImageIcon, Plus, Minus, Send,
  AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States
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

  // ១. លាងសម្អាត URL រូបភាព
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && img.startsWith('data:image')) return img;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanImg = typeof img === 'string' ? (img.startsWith('/') ? img.slice(1) : img) : img;
    const finalPath = cleanImg.startsWith('uploads/') ? cleanImg : `uploads/${cleanImg}`;
    return `${baseUrl}/${finalPath}`;
  };

  // ២. ទាញទិន្នន័យទំនិញ
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`); 
        const data = await response.json();
        const foundProduct = data.products.find(p => (p.id || p._id).toString() === id.toString());
        setProduct(foundProduct);
      } catch (err) {
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ៣. ប្ដូរវិធីសាស្ត្របង់ប្រាក់តាមតំបន់
  useEffect(() => {
    setOrderForm(prev => ({
      ...prev,
      paymentMethod: orderForm.location === 'តាមខេត្ត' ? 'ABA / វីង' : 'បង់ប្រាក់ផ្ទាល់ (COD)'
    }));
  }, [orderForm.location]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayslip(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // មុខងារពណ៌ស្តុកតាមកម្រិត (Live Stock Logic)
  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'អស់ស្តុក', color: 'bg-red-500', text: 'text-red-500', icon: <X size={12}/> };
    if (stock <= 5) return { label: `ជិតអស់ហើយ (សល់ ${stock})`, color: 'bg-orange-500', text: 'text-orange-500', icon: <AlertCircle size={12}/> };
    return { label: `មានក្នុងស្តុក (${stock})`, color: 'bg-emerald-500', text: 'text-emerald-500', icon: <CheckCircle2 size={12}/> };
  };

  const productImages = product?.images || (product?.image ? [product.image] : []);
  const deliveryFee = orderForm.location === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = product ? product.price * orderForm.qty : 0;
  const finalTotal = subTotal + deliveryFee;
  const stockStatus = getStockStatus(product?.stock || 0);

  // ៤. មុខងារបញ្ជូនការកុម្ម៉ង់
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (orderForm.qty > product.stock) {
      alert("សូមអភ័យទោស ចំនួនដែលអ្នកកុម្ម៉ង់លើសពីស្តុកដែលមាន!");
      return;
    }
    if (orderForm.paymentMethod === 'ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់របស់អ្នក!");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('productId', product.id || product._id);
    formData.append('productName', product.name);
    formData.append('qty', orderForm.qty);
    formData.append('customerName', orderForm.name);
    formData.append('customerPhone', orderForm.phone);
    formData.append('customerAddress', orderForm.address);
    formData.append('location', orderForm.location);
    formData.append('paymentMethod', orderForm.paymentMethod);
    formData.append('deliveryFee', deliveryFee);
    formData.append('total', finalTotal.toFixed(2));
    if (payslip) formData.append('payslip', payslip);

    try {
      const res = await fetch(`${API_URL}/api/orders`, { 
        method: 'POST', 
        body: formData 
      });

      if (res.ok) {
        // បញ្ជូនទៅកាន់ Success Page ជាមួយទិន្នន័យ Order
        navigate('/success', { 
            state: { 
              order: {
                id: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
                total: finalTotal.toFixed(2),
                productName: product.name,
                qty: orderForm.qty
              } 
            } 
        });
      } else {
        const errorData = await res.json();
        throw new Error(errorData.message || "ការកុម្ម៉ង់មានបញ្ហា");
      }
    } catch (err) {
      alert("កំហុស៖ " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="text-blue-600 animate-spin mb-4" size={40} />
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Details...</p>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-bold">រកមិនឃើញទំនិញឡើយ!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 lg:pb-10">
      {/* Mobile Top Bar */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-800"><ChevronLeft size={24} /></button>
        <span className="ml-2 font-black text-slate-800 uppercase italic truncate text-sm">{product.name}</span>
      </div>

      <main className="container mx-auto lg:px-4 lg:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* ១. ផ្នែករូបភាព (Gallery) */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden aspect-square group relative">
              <img 
                src={getImageUrl(productImages[activeImg])} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                alt={product.name} 
              />
              <div className="absolute top-6 left-6">
                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${stockStatus.color}`}>
                    {stockStatus.icon} {stockStatus.label}
                 </div>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto px-4 lg:px-0 pb-2 scrollbar-hide">
              {productImages.map((img, i) => (
                <button 
                    key={i} 
                    onClick={() => setActiveImg(i)} 
                    className={`w-20 h-20 rounded-2xl border-4 shrink-0 overflow-hidden transition-all duration-300 ${activeImg === i ? 'border-blue-600 scale-105 shadow-lg shadow-blue-100' : 'border-white opacity-60'}`}
                >
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* ២. ផ្នែកព័ត៌មានលម្អិត (Info) */}
          <div className="px-6 lg:px-0 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">Official Store Warranty</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase italic leading-tight tracking-tighter">
                {product.name}
              </h1>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-blue-600 tracking-tighter">${product.price}</p>
                <p className="text-slate-300 line-through font-bold">${(product.price * 1.2).toFixed(2)}</p>
              </div>
            </div>

            {/* ការជ្រើសរើសចំនួន (Quantity Selector) */}
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Quantity</label>
               <div className="flex items-center gap-6 bg-white p-2 rounded-[2rem] border border-slate-100 shadow-sm w-fit">
                <button 
                    disabled={product.stock <= 0 || orderForm.qty <= 1}
                    onClick={() => setOrderForm(p => ({...p, qty: p.qty - 1}))}
                    className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 disabled:opacity-20"
                >
                    <Minus size={24} />
                </button>
                <span className="text-3xl font-black w-12 text-center text-slate-800">{orderForm.qty}</span>
                <button 
                    disabled={product.stock <= 0 || orderForm.qty >= product.stock}
                    onClick={() => setOrderForm(p => ({...p, qty: p.qty + 1}))}
                    className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 disabled:opacity-20"
                >
                    <Plus size={24} />
                </button>
               </div>
               {orderForm.qty >= product.stock && product.stock > 0 && (
                   <p className="text-[10px] font-bold text-orange-500 animate-pulse italic ml-2">! You reached the maximum stock available</p>
               )}
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <PackagePlus size={14} /> Product Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium italic">
                {product.detail || "No description available for this premium product."}
              </p>
            </div>

            <button 
              onClick={() => setShowOrderModal(true)} 
              disabled={product.stock <= 0} 
              className={`hidden lg:flex w-full h-20 rounded-[2rem] font-black text-xl items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98] uppercase italic tracking-widest ${product.stock > 0 ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
            >
              <ShoppingCart size={24} /> {product.stock > 0 ? 'Order Now' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </main>

      {/* ៣. ប៊ូតុងបញ្ជាទិញសម្រាប់ Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0,0.05)]">
        <div className="bg-slate-100 w-14 h-14 rounded-2xl flex items-center justify-center font-black text-slate-800">
            {orderForm.qty}
        </div>
        <button 
          onClick={() => setShowOrderModal(true)} 
          disabled={product.stock <= 0} 
          className={`flex-1 h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg uppercase italic tracking-widest ${product.stock > 0 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400'}`}
        >
          <ShoppingCart size={20} /> {product.stock > 0 ? 'Order Now' : 'Sold Out'}
        </button>
      </div>

      {/* ៤. Order Modal (Checkout) */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-500 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl text-white">
                    <PackagePlus size={20} />
                </div>
                <h2 className="font-black uppercase italic text-xl tracking-tight text-slate-800">Review Order</h2>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-3 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
              {/* Product Preview in Modal */}
              <div className="bg-blue-50/50 p-5 rounded-[2rem] border border-blue-100 flex justify-between items-center shadow-inner">
                  <div className="flex items-center gap-4">
                      <img src={getImageUrl(productImages[0])} className="w-16 h-16 rounded-2xl object-cover border-4 border-white shadow-md" alt="" />
                      <div>
                          <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1 leading-none">Selected Item</p>
                          <p className="text-sm font-black uppercase italic truncate max-w-[150px] text-slate-800 leading-none">{product.name}</p>
                      </div>
                  </div>
                  <div className="text-right">
                      <p className="text-xl font-black text-slate-900 leading-none">{orderForm.qty} PCS</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Quantity</p>
                  </div>
              </div>

              {/* Customer Inputs */}
              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="text" placeholder="Full Name" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                </div>
                <div className="relative group">
                  <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required type="tel" placeholder="Phone Number" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                </div>
                <div className="relative group">
                  <MapPin className="absolute left-5 top-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <textarea required placeholder="Delivery Address (Village/Commune/District)" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm h-28 focus:ring-2 focus:ring-blue-500 resize-none border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}></textarea>
                </div>
              </div>

              {/* Location Select */}
              <div className="grid grid-cols-2 gap-4">
                {['ភ្នំពេញ', 'តាមខេត្ត'].map(l => (
                  <button key={l} type="button" onClick={() => setOrderForm({...orderForm, location: l})} className={`p-5 rounded-[1.5rem] border-2 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${orderForm.location === l ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-md' : 'border-slate-50 text-slate-300 hover:bg-slate-50'}`}>
                    <Truck size={16}/> {l}
                  </button>
                ))}
              </div>

              {/* ABA / QR Section */}
              {orderForm.paymentMethod === 'ABA / វីង' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500">
                  <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white text-center shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="bg-white p-3 rounded-3xl inline-block mb-4 relative z-10 shadow-2xl">
                      <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABA_000777111_AMOUNT_${finalTotal}`} className="w-32 h-32" alt="QR" />
                    </div>
                    <p className="font-black text-xl italic uppercase tracking-widest relative z-10 leading-none">24 STORE</p>
                    <p className="text-[10px] opacity-70 uppercase tracking-widest mt-2 relative z-10">ABA: 000 777 111 | Name: SHOP OWNER</p>
                  </div>
                  
                  <label className="block p-6 border-4 border-dashed border-blue-100 rounded-[2rem] text-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {previewUrl ? (
                        <div className="relative inline-block">
                            <img src={previewUrl} className="h-40 rounded-2xl object-cover border-4 border-white shadow-xl" alt="preview" />
                            <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full shadow-lg">
                                <CheckCircle2 size={20}/>
                            </div>
                        </div>
                    ) : (
                      <div className="text-blue-500 flex flex-col items-center gap-2 font-black text-[10px] uppercase tracking-widest">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ImageIcon size={28}/>
                        </div>
                        Upload Payment Receipt
                      </div>
                    )}
                  </label>
                </div>
              )}

              {/* Invoice Summary */}
              <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white space-y-4 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-10 -mt-10"></div>
                <div className="flex justify-between text-[10px] opacity-50 font-black uppercase tracking-widest">
                  <span>Product Subtotal</span>
                  <span>${subTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] opacity-50 font-black uppercase tracking-widest">
                  <span>Shipping Fee ({orderForm.location})</span>
                  <span>${deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <span className="italic uppercase font-black text-sm tracking-tighter">Total Amount</span>
                  <span className="text-3xl font-black text-blue-400 tracking-tighter">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                disabled={isSubmitting} 
                className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-blue-500/20 active:scale-[0.98] disabled:bg-slate-300 transition-all flex items-center justify-center gap-3 uppercase italic tracking-widest"
              >
                {isSubmitting ? (
                    <>
                        <Loader2 className="animate-spin" size={24}/> 
                        Processing Order...
                    </>
                ) : (
                    <>
                        <Send size={22} className="-rotate-12 group-hover:translate-x-1 transition-transform"/> 
                        Confirm Order
                    </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;