import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import qrImage from '../assets/QR/KB_QR.PNG'; // ប្រើរូបភាពក្នុង Folder assets របស់បង
import { 
  ChevronLeft, ShoppingCart, Loader2, X, Phone, MapPin, 
  User, PackagePlus, Truck, ImageIcon, Plus, Minus, Send,
  AlertCircle, CheckCircle2, ShieldCheck, HelpCircle
} from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // States ដើមរបស់បងទាំងអស់
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false); // បន្ថែមថ្មីសម្រាប់សួរបញ្ជាក់
  const [payslip, setPayslip] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [orderForm, setOrderForm] = useState({
    name: '',
    phone: '',
    address: '',
    qty: 1,
    location: 'ភ្នំពេញ',
    paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (COD)',
    shippingService: 'VET Express',
    taxiPlate: '',
    taxiPhone: '',
    taxiStation: ''
  });

  // ១. លាងសម្អាត URL រូបភាព (កូដចាស់បង)
  const getImageUrl = (img) => {
    if (!img) return 'https://placehold.co/600x400?text=No+Image';
    if (typeof img === 'string' && img.startsWith('data:image')) return img;
    const baseUrl = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
    const cleanImg = typeof img === 'string' ? (img.startsWith('/') ? img.slice(1) : img) : img;
    const finalPath = cleanImg.startsWith('uploads/') ? cleanImg : `uploads/${cleanImg}`;
    return `${baseUrl}/${finalPath}`;
  };

  // ២. ទាញទិន្នន័យទំនិញ (កូដចាស់បង)
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

  // ៣. ប្ដូរវិធីសាស្ត្របង់ប្រាក់តាមតំបន់ (កូដចាស់បង)
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

  // មុខងារពណ៌ស្តុកតាមកម្រិត (កូដចាស់បង)
  const getStockStatus = (stock) => {
    if (stock <= 0) return { label: 'អស់ស្តុក', color: 'bg-red-500', icon: <X size={12}/> };
    if (stock <= 5) return { label: `ជិតអស់ហើយ`, color: 'bg-orange-500', icon: <AlertCircle size={12}/> };
    return { label: `មានក្នុងស្តុក`, color: 'bg-emerald-500', icon: <CheckCircle2 size={12}/> };
  };

  const productImages = product?.images || (product?.image ? [product.image] : []);
  const deliveryFee = orderForm.location === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = product ? product.price * orderForm.qty : 0;
  const finalTotal = subTotal + deliveryFee;
  const stockStatus = getStockStatus(product?.stock || 0);
  const remainingStock = (product?.stock || 0) - orderForm.qty;

  // ៤. មុខងារបញ្ជូនការកុម្ម៉ង់ (រក្សារចនាសម្ព័ន្ធដើមបង ប៉ុន្តែបំបែកទៅជា Final Submit)
  const handlePreSubmit = (e) => {
    e.preventDefault();
    if (orderForm.qty > product.stock) {
      alert("សូមអភ័យទោស ចំនួនដែលអ្នកកុម្ម៉ង់លើសពីស្តុកដែលមាន!");
      return;
    }
    if (orderForm.paymentMethod === 'ABA / វីង' && !payslip) {
      alert("សូមមេត្តាអាប់ឡូតរូបភាពវិក្កយបត្របង់ប្រាក់របស់អ្នក!");
      return;
    }
    setShowConfirmModal(true); // បង្ហាញ Modal សួរបញ្ជាក់សិន
  };

  const handleFinalSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

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
    
    if (orderForm.location === 'តាមខេត្ត') {
        formData.append('shippingService', orderForm.shippingService);
        if (orderForm.shippingService === 'ឡានតាក់ស៊ី') {
            formData.append('taxiPlate', orderForm.taxiPlate);
            formData.append('taxiPhone', orderForm.taxiPhone);
            formData.append('taxiStation', orderForm.taxiStation);
        }
    }

    if (payslip) formData.append('payslip', payslip);

    try {
      const res = await fetch(`${API_URL}/api/orders`, { method: 'POST', body: formData });
      if (res.ok) {
        navigate('/success', { 
          state: { order: { id: 'ORD-' + Math.floor(1000 + Math.random() * 9000), total: finalTotal.toFixed(2), productName: product.name, qty: orderForm.qty } } 
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
      <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading...</p>
    </div>
  );

  if (!product) return <div className="text-center py-20 font-bold">រកមិនឃើញទំនិញ!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans pb-24 lg:pb-10">
      {/* Mobile Top Bar (កូដចាស់បង) */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-800"><ChevronLeft size={24} /></button>
        <span className="ml-2 font-black text-slate-800 uppercase italic truncate text-sm">{product.name}</span>
      </div>

      <main className="container mx-auto lg:px-4 lg:py-10 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* ១. Image Gallery (កូដចាស់បង) */}
          <div className="space-y-4 lg:sticky lg:top-24 h-fit">
            <div className="bg-white lg:rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden aspect-square group relative">
              <img src={getImageUrl(productImages[activeImg])} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={product.name} />
              <div className="absolute top-6 left-6">
                 <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg ${stockStatus.color}`}>
                    {stockStatus.icon} {stockStatus.label}
                 </div>
              </div>
            </div>
            
            <div className="flex gap-3 overflow-x-auto px-4 lg:px-0 pb-2 scrollbar-hide">
              {productImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded-2xl border-4 shrink-0 overflow-hidden transition-all duration-300 ${activeImg === i ? 'border-blue-600 scale-105 shadow-lg shadow-blue-100' : 'border-white opacity-60'}`}>
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* ២. Product Info (កូដចាស់បង) */}
          <div className="px-6 lg:px-0 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-blue-500" />
                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] italic">Official Store Warranty</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-slate-900 uppercase italic leading-tight tracking-tighter">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <p className="text-5xl font-black text-blue-600 tracking-tighter">${product.price}</p>
              </div>
            </div>

            {/* QTY Selector (កូដចាស់បង) */}
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Select Quantity</label>
                <div className="mt-1.5 px-20 overflow-hidden "><span className={`text-[15px] font-black uppercase px-2 py-0.5 rounded-full whitespace-nowrap transition-all duration-300 ${remainingStock <= 3 ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>សល់ {remainingStock}</span></div>
               <div className="flex items-center gap-6">
                
                  <div className="flex items-center gap-6 bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-sm w-fit">
                    <button disabled={product.stock <= 0 || orderForm.qty <= 1} onClick={() => setOrderForm(p => ({...p, qty: p.qty - 1}))} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90 disabled:opacity-20"><Minus size={24} /></button>
                    <div className="flex flex-col items-center min-w-[70px]">
                      <span className="text-3xl font-black text-slate-800 leading-none">{orderForm.qty}</span>
                      
                    </div>
                    
                    <button disabled={product.stock <= 0 || orderForm.qty >= product.stock} onClick={() => setOrderForm(p => ({...p, qty: p.qty + 1}))} className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-90 disabled:opacity-20"><Plus size={24} /></button>
                  </div>
                  
               </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2"><PackagePlus size={14} /> Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line font-medium italic">{product.detail || "No description available."}</p>
            </div>

            <button onClick={() => setShowOrderModal(true)} disabled={product.stock <= 0} className={`hidden lg:flex w-full h-20 rounded-[2rem] font-black text-xl items-center justify-center gap-4 shadow-2xl transition-all active:scale-[0.98] uppercase italic tracking-widest ${product.stock > 0 ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}><ShoppingCart size={24} /> {product.stock > 0 ? 'Order Now' : 'Out of Stock'}</button>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Bar (កូដចាស់បង) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50 flex gap-3 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="bg-slate-100 px-5 h-14 rounded-2xl flex flex-col items-center justify-center">
            <span className="text-[9px] font-black text-slate-400 uppercase leading-none">QTY</span>
            <span className="font-black text-slate-800 leading-none mt-1 text-lg">{orderForm.qty}</span>
        </div>
        <button onClick={() => setShowOrderModal(true)} disabled={product.stock <= 0} className={`flex-1 h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg uppercase italic tracking-widest ${product.stock > 0 ? 'bg-blue-600 text-white shadow-blue-200' : 'bg-slate-200 text-slate-400'}`}><ShoppingCart size={20} /> {product.stock > 0 ? 'Order Now' : 'Sold Out'}</button>
      </div>

      {/* Order Modal - កែសម្រួល Layout ឱ្យពេញអេក្រង់លើ Mobile (កូដចាស់បងទាំងអស់) */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[3rem] lg:rounded-[3rem] shadow-2xl flex flex-col max-h-[95vh] animate-in slide-in-from-bottom duration-500 overflow-hidden">
            <div className="p-8 border-b flex justify-between items-center shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-3"><div className="p-2 bg-blue-600 rounded-xl text-white"><PackagePlus size={20} /></div><h2 className="font-black uppercase italic text-xl tracking-tight text-slate-800">Review Order</h2></div>
              <button onClick={() => setShowOrderModal(false)} className="p-3 bg-white rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all shadow-sm"><X size={20}/></button>
            </div>

            <form onSubmit={handlePreSubmit} className="p-8 space-y-6 overflow-y-auto scrollbar-hide">
              <div className="space-y-4">
                <div className="relative group"><User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required type="text" placeholder="ឈ្មោះអ្នកទទួល" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} /></div>
                <div className="relative group"><Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} /><input required type="tel" placeholder="លេខទូរស័ព្ទ" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500 border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} /></div>
                <div className="relative group"><MapPin className="absolute left-5 top-6 text-slate-400" size={18} /><textarea required placeholder="អាសយដ្ឋានលម្អិត" className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-[1.5rem] outline-none font-bold text-sm h-28 focus:ring-2 focus:ring-blue-500 resize-none border border-transparent focus:bg-white transition-all shadow-inner" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}></textarea></div>
              </div>

              <div className="space-y-3">
                <label className="text-[15px] font-black text-yellow-600 uppercase tracking-widest ml-1">វិធីសាស្រ្តដឹកជញ្ជូន</label>
                <div className="grid grid-cols-1 gap-3">
                  {[{ id: 'ភ្នំពេញ', price: 1.5, icon: <Truck size={18}/> }, { id: 'តាមខេត្ត', price: 2.5, icon: <Truck size={18}/> }].map((method) => (
                    <button key={method.id} type="button" onClick={() => setOrderForm({...orderForm, location: method.id})} className={`flex items-center justify-between p-5 rounded-[1.5rem] border-2 transition-all ${orderForm.location === method.id ? 'border-blue-600 bg-blue-50 shadow-md' : 'border-slate-50 bg-white opacity-60'}`}>
                      <div className="flex items-center gap-4"><div className={`p-3 rounded-xl ${orderForm.location === method.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>{method.icon}</div><div className="text-left"><p className={`font-black uppercase italic text-sm ${orderForm.location === method.id ? 'text-blue-600' : 'text-slate-600'}`}>ដឹកជញ្ជូន {method.id}</p></div></div>
                      <p className="font-black text-lg text-slate-900">${method.price.toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {orderForm.location === 'តាមខេត្ត' && (
                <div className="space-y-4 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-in zoom-in duration-300">
                    <label className="text-[15px] font-black text-yellow-600 uppercase tracking-widest ml-1">ជ្រើសរើសក្រុមហ៊ុន ឬ តាក់ស៊ី</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['VET Express', 'J&T Express', 'Capitol', 'ឡានតាក់ស៊ី'].map((s) => (
                        <button key={s} type="button" onClick={() => setOrderForm({...orderForm, shippingService: s})} className={`py-3 rounded-xl border-2 font-black text-[12px] uppercase transition-all ${orderForm.shippingService === s ? 'border-blue-600 bg-white text-blue-600 shadow-sm' : 'border-transparent bg-slate-200/50 text-slate-400'}`}>{s}</button>
                      ))}
                    </div>
                    {orderForm.shippingService === 'ឡានតាក់ស៊ី' && (
                      <div className="space-y-3 pt-3 border-t border-slate-200">
                        <div className="grid grid-cols-2 gap-2">
                          <input required placeholder="ស្លាកលេខឡាន" className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none" value={orderForm.taxiPlate} onChange={e => setOrderForm({...orderForm, taxiPlate: e.target.value})} />
                          <input required placeholder="លេខទូរស័ព្ទឡាន" className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none" value={orderForm.taxiPhone} onChange={e => setOrderForm({...orderForm, taxiPhone: e.target.value})} />
                        </div>
                        <input required placeholder="ទីតាំងបេនឡាន" className="w-full px-4 py-3 bg-white rounded-xl border text-[11px] font-bold outline-none" value={orderForm.taxiStation} onChange={e => setOrderForm({...orderForm, taxiStation: e.target.value})} />
                      </div>
                    )}
                    {/* QR Payment Area */}
                    <div className="bg-blue-600 p-8 rounded-[2rem] text-white text-center shadow-xl">
                      <div className="bg-white p-3 rounded-3xl inline-block mb-4"><img src={qrImage} className="w-48 h-auto rounded-xl" alt="ABA QR" /></div>
                      <p className="font-black text-xl italic uppercase tracking-widest">Payment KHQR</p>
                      <p className="text-[15px] opacity-70 italic">ABA: 000 777 111</p>
                    </div>
                    <label className="block p-6 border-4 border-dashed border-blue-100 rounded-[2rem] text-center cursor-pointer bg-white">
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                      {previewUrl ? <img src={previewUrl} className="h-40 mx-auto rounded-2xl object-cover shadow-xl border-4 border-white" alt="preview" /> : <div className="text-red-500 flex flex-col items-center gap-2 font-black text-[15px] uppercase"><ImageIcon size={28} />សូមអាប់ឡូតរូបភាពវិក្កយបត្រ</div>}
                    </label>
                </div>
              )}

              <div className="bg-neutral-950 p-8 rounded-[2.5rem] text-white shadow-2xl border-b-8 border-yellow-400">
                <div className="flex justify-between text-[12px] font-black uppercase tracking-widest"><span>ទំនិញ ({orderForm.qty} មុខ)</span><span className="text-yellow-500">${subTotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-[12px] font-black uppercase tracking-widest border-b border-white/10 pb-2"><span>សេវាដឹកជញ្ជូន</span><span className="text-red-500">${deliveryFee.toFixed(2)}</span></div>
                <div className="flex justify-between items-center pt-2"><span className="italic uppercase font-black text-sm">សរុបចុងក្រោយ</span><span className="text-3xl font-black text-blue-400">${finalTotal.toFixed(2)}</span></div>
              </div>

              <button type="submit" className="w-full bg-white text-yellow-600 py-6 rounded-[2rem] font-black text-xl shadow-xl active:scale-[0.98] border-2 border-yellow-500 uppercase italic flex items-center justify-center gap-3"><Send size={22} className="-rotate-12"/> បញ្ជាក់ការកម្មង់</button>
            </form>
          </div>
        </div>
      )}

      {/* ៥. Confirmation Modal (Modal សួរបញ្ជាក់ដែលបងចង់បាន) */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in duration-300 text-center">
            <div className="w-20 h-20 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6"><HelpCircle size={40} /></div>
            <h3 className="text-2xl font-black text-slate-800 uppercase italic mb-2 tracking-tighter">តើអ្នកសម្រេចចិត្តចង់ទិញឬទេ?</h3>
            <p className="text-slate-500 font-medium text-sm mb-8 leading-relaxed">សូមពិនិត្យមើលព័ត៌មាន និងចំនួនទំនិញឱ្យបានត្រឹមត្រូវ មុនពេលចុចបញ្ជូនការកុម្ម៉ង់នេះ។</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleFinalSubmit} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all uppercase italic">បាទ/ចាស ប្រាកដហើយ</button>
              <button onClick={() => setShowConfirmModal(false)} className="w-full bg-slate-100 text-slate-400 py-5 rounded-2xl font-black text-lg active:scale-95 transition-all uppercase italic">ត្រឡប់ក្រោយ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;