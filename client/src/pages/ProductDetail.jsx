import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../apiConfig';
import { 
  ChevronLeft, ShoppingCart, Loader2, X, Phone, MapPin, 
  User, PackagePlus, Truck, ImageIcon
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
    if (typeof img === 'string' && img.startsWith('http')) return img.replace('http://localhost:5000', baseUrl);
    const cleanImg = img.startsWith('/') ? img.slice(1) : img;
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
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // ៣. ប្ដូរវិធីសាស្ត្របង់ប្រាក់តាមតំបន់
  useEffect(() => {
    if (orderForm.location === 'តាមខេត្ត') {
      setOrderForm(prev => ({ ...prev, paymentMethod: 'ABA / វីង' }));
    } else {
      setOrderForm(prev => ({ ...prev, paymentMethod: 'បង់ប្រាក់ផ្ទាល់ (COD)' }));
    }
  }, [orderForm.location]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPayslip(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const productImages = product?.images || (product?.image ? [product.image] : []);
  const deliveryFee = orderForm.location === 'ភ្នំពេញ' ? 1.5 : 2.5;
  const subTotal = product ? product.price * orderForm.qty : 0;
  const finalTotal = subTotal + deliveryFee;

  // ៤. មុខងារបញ្ជូនការកុម្ម៉ង់ (Submit to Backend only)
  const handleOrderSubmit = async (e) => {
    e.preventDefault();
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
    formData.append('total', finalTotal);
    if (payslip) formData.append('payslip', payslip);

    try {
      const res = await fetch(`${API_URL}/api/orders`, { 
        method: 'POST', 
        body: formData 
      });

      if (res.ok) {
        alert("🎉 ការកុម្ម៉ង់បានជោគជ័យ! យើងនឹងទាក់ទងទៅអ្នកឆាប់ៗ។");
        setShowOrderModal(false);
        navigate('/');
      } else {
        throw new Error("ការកុម្ម៉ង់មានបញ្ហា");
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

  if (!product) return <div className="text-center py-20 font-bold">រកមិនឃើញទំនិញឡើយ!</div>;

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans">
      {/* Header Mobile */}
      <div className="lg:hidden sticky top-0 z-50 bg-white/90 backdrop-blur-md px-4 h-14 flex items-center border-b border-slate-100">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-800"><ChevronLeft size={24} /></button>
        <span className="ml-2 font-black text-slate-800 uppercase italic truncate text-sm">{product.name}</span>
      </div>

      <main className="container mx-auto lg:px-4 lg:py-10 max-w-6xl pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gallery */}
          <div className="space-y-4 lg:sticky lg:top-24">
            <div className="bg-white lg:rounded-[2rem] shadow-sm border overflow-hidden aspect-square">
              <img src={getImageUrl(productImages[activeImg])} className="w-full h-full object-cover" alt={product.name} />
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 lg:px-0 pb-2 scrollbar-hide">
              {productImages.map((img, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-xl border-2 shrink-0 overflow-hidden ${activeImg === i ? 'border-blue-600' : 'border-transparent shadow-sm'}`}>
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="px-6 lg:px-0 space-y-6">
            <div>
              <span className="text-blue-600 font-black text-[10px] uppercase tracking-widest">Premium Product</span>
              <h1 className="text-3xl font-black text-slate-900 mt-1 uppercase italic leading-tight">{product.name}</h1>
              <p className="text-3xl font-black text-blue-600 mt-2">${product.price}</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{product.detail || "គ្មានការពិពណ៌នា។"}</p>
            </div>

            <button onClick={() => setShowOrderModal(true)} disabled={product.stock <= 0} className={`hidden lg:flex w-full h-16 rounded-2xl font-black text-lg items-center justify-center gap-3 shadow-xl transition-all active:scale-95 ${product.stock > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}>
              <ShoppingCart size={20} /> {product.stock > 0 ? 'កុម្ម៉ង់ឥឡូវនេះ' : 'អស់ស្តុក'}
            </button>
          </div>
        </div>
      </main>

      {/* Floating Button Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t z-50">
        <button onClick={() => setShowOrderModal(true)} disabled={product.stock <= 0} className={`w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-lg ${product.stock > 0 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
          <ShoppingCart size={20} /> {product.stock > 0 ? 'កុម្ម៉ង់ឥឡូវនេះ' : 'អស់ស្តុក'}
        </button>
      </div>

      {/* Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-end lg:items-center justify-center p-0 lg:p-4">
          <div className="bg-white w-full max-w-lg rounded-t-[2rem] lg:rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] animate-in slide-in-from-bottom duration-300">
            <div className="p-6 border-b flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <PackagePlus className="text-blue-600" />
                <h2 className="font-black uppercase italic text-lg">Checkout</h2>
              </div>
              <button onClick={() => setShowOrderModal(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleOrderSubmit} className="p-6 space-y-5 overflow-y-auto scrollbar-hide">
              <div className="space-y-3">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="text" placeholder="ឈ្មោះអ្នកទទួល" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" value={orderForm.name} onChange={e => setOrderForm({...orderForm, name: e.target.value})} />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input required type="text" placeholder="លេខទូរស័ព្ទ" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-blue-500" value={orderForm.phone} onChange={e => setOrderForm({...orderForm, phone: e.target.value})} />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" size={18} />
                  <textarea required placeholder="អាសយដ្ឋានលម្អិត" className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl outline-none font-bold text-sm h-24 focus:ring-2 focus:ring-blue-500 resize-none" value={orderForm.address} onChange={e => setOrderForm({...orderForm, address: e.target.value})}></textarea>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {['ភ្នំពេញ', 'តាមខេត្ត'].map(l => (
                  <button key={l} type="button" onClick={() => setOrderForm({...orderForm, location: l})} className={`p-4 rounded-2xl border-2 font-bold text-xs flex items-center justify-center gap-2 ${orderForm.location === l ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                    <Truck size={16}/> {l}
                  </button>
                ))}
              </div>

              {orderForm.paymentMethod === 'ABA / វីង' && (
                <div className="space-y-4 animate-in fade-in duration-500">
                  <div className="bg-blue-600 p-6 rounded-3xl text-white text-center shadow-lg">
                    <div className="bg-white p-2 rounded-2xl inline-block mb-3">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=ABA_PAYMENT_LINK" className="w-32 h-32" alt="QR" />
                    </div>
                    <p className="font-black text-lg italic">24 STORE</p>
                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Scan to Pay: ${finalTotal.toFixed(2)}</p>
                  </div>
                  <label className="block p-4 border-2 border-dashed border-blue-200 rounded-2xl text-center cursor-pointer hover:bg-blue-50 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    {previewUrl ? <img src={previewUrl} className="h-32 mx-auto rounded-lg object-cover" alt="preview" /> : (
                      <div className="text-blue-500 flex flex-col items-center gap-1 font-black text-[10px] uppercase">
                        <ImageIcon size={24}/> Upload Payslip
                      </div>
                    )}
                  </label>
                </div>
              )}

              <div className="bg-slate-900 p-5 rounded-[1.5rem] text-white space-y-2">
                <div className="flex justify-between text-xs opacity-60 font-bold">
                  <span>Quantity</span>
                  <div className="flex items-center gap-3 bg-white/10 px-2 py-1 rounded-full text-blue-400">
                    <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.max(1, orderForm.qty - 1)})}>-</button>
                    <span>{orderForm.qty}</span>
                    <button type="button" onClick={() => setOrderForm({...orderForm, qty: Math.min(product.stock, orderForm.qty + 1)})}>+</button>
                  </div>
                </div>
                <div className="flex justify-between font-black text-lg pt-2 border-t border-white/10">
                  <span className="italic uppercase text-sm">Total:</span>
                  <span className="text-blue-400">${finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <button disabled={isSubmitting} className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-lg shadow-xl shadow-blue-100 active:scale-95 disabled:bg-slate-300">
                {isSubmitting ? <Loader2 className="animate-spin mx-auto"/> : "Confirm Order"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;