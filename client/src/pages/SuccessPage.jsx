import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas'; 
import { 
  CheckCircle2, Home, Download, Camera,
  User, Phone, MapPin, Image as ImageIcon,
  AlertTriangle, ShieldCheck, MessageCircle, Info,
  PackageCheck, Truck, Clock
} from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitAlert, setShowExitAlert] = useState(false);
  const invoiceRef = useRef(null);

  // ទាញទិន្នន័យពី Checkout (ជាមួយ Fallback ប្រសិនបើបាត់ទិន្នន័យ)
  const orderData = location.state?.order || {
    id: 'ORD-' + Math.floor(10000 + Math.random() * 90000),
    total: '0.00',
    productName: 'មិនមានឈ្មោះទំនិញ',
    qty: 0,
    customerName: 'មិនមានឈ្មោះ',
    phone: 'មិនមានលេខទូរស័ព្ទ',
    address: 'មិនមានអាសយដ្ឋាន',
    location: 'មិនបានបញ្ជាក់តំបន់', // សម្រាប់ដឹកជញ្ជូន
    payslip: null // រូបភាពវិក្កយបត្រ
  };

  // ការពារការ Back ឬ Refresh ដោយអចេតនា
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // មុខងារ Screenshot រក្សាទុកក្នុងទូរស័ព្ទ/កុំព្យូទ័រ
  const handleScreenshot = async () => {
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 3, 
          useCORS: true,
          backgroundColor: "#F1F5F9", 
          borderRadius: 40,
        });
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `Receipt-${orderData.id}.png`;
        link.click();
      } catch (err) {
        alert("ការថតរូបមានបញ្ហា! សូម Screenshot តាមទូរស័ព្ទផ្ទាល់។");
      }
    }
  };

  const handleGoHome = () => {
    setShowExitAlert(true);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 font-sans print:bg-white print:p-0 transition-all">
      
      <div className="max-w-md w-full relative">
        
        {/* --- ផ្នែកវិក្កយបត្រដែលត្រូវថតរូប (Invoice Card) --- */}
        <div 
          ref={invoiceRef} 
          className="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-white relative animate-in zoom-in-95 duration-500"
        >
          {/* Header Banner */}
          <div className="bg-blue-600 p-10 text-center text-white relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full -z-0"></div>
            <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-2xl rotate-6 animate-bounce relative z-10">
              <CheckCircle2 size={45} className="text-blue-600" />
            </div>
            <h1 className="text-3xl font-black uppercase italic tracking-tighter relative z-10">Order Success!</h1>
            <p className="text-blue-100 text-[10px] font-black uppercase tracking-[0.3em] mt-3 opacity-80 relative z-10">Official Receipt • 24 STORE</p>
          </div>

          <div className="p-8 space-y-7 relative">
            {/* Order Identity & Time */}
            <div className="flex justify-between items-end px-2">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <PackageCheck size={12}/> Order ID
                    </p>
                    <p className="font-black text-slate-900 text-lg uppercase italic leading-none">#{orderData.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center justify-end gap-1">
                      <Clock size={12}/> Time
                    </p>
                    <p className="font-bold text-slate-700 text-sm leading-none">{new Date().toLocaleDateString('km-KH')}</p>
                </div>
            </div>

            {/* Customer & Shipping Details (Full Data) */}
            <div className="bg-slate-50 rounded-[2.5rem] p-6 border border-slate-100 space-y-4">
              <h3 className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <ShieldCheck size={15}/> Shipping Details
              </h3>
              <div className="space-y-3 text-sm font-bold text-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><User size={14}/></div>
                  <span className="uppercase italic">{orderData.customerName}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400"><Phone size={14}/></div>
                  <span>{orderData.phone}</span>
                </div>
                <div className="flex items-start gap-3 border-t border-slate-200/60 pt-4 mt-2">
                  <div className="p-2 bg-white rounded-lg shadow-sm text-slate-400 shrink-0"><MapPin size={14}/></div>
                  <div className="space-y-1">
                    <span className="text-[11px] leading-relaxed text-slate-600 font-medium block">{orderData.address}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-blue-600 uppercase italic bg-blue-50 px-2 py-1 rounded-md">
                      <Truck size={10}/> {orderData.location}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Summary */}
            <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3">Items Purchased</label>
                <div className="flex items-center justify-between p-5 bg-white border-2 border-slate-50 rounded-3xl shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center font-black italic shadow-lg shadow-blue-100">{orderData.qty}x</div>
                        <p className="font-black text-slate-800 uppercase italic text-[13px] tracking-tight line-clamp-1">{orderData.productName}</p>
                    </div>
                    <p className="font-black text-blue-600 text-xl tracking-tighter">${orderData.total}</p>
                </div>
            </div>

            {/* Payslip Preview (ប្រសិនបើមានរូបភាព) */}
            {orderData.payslip && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-3 flex items-center gap-2">
                  <ImageIcon size={14}/> Your Payment Receipt
                </label>
                <div className="relative group">
                  <img 
                    src={orderData.payslip} 
                    className="w-full h-44 object-cover rounded-[2.5rem] border-4 border-slate-50 shadow-md group-hover:scale-[1.02] transition-transform" 
                    alt="Receipt" 
                  />
                  <div className="absolute inset-0 bg-blue-600/5 rounded-[2.5rem]"></div>
                </div>
              </div>
            )}

            {/* Total Paid Highlighting (Style ដូច Checkout) */}
            <div className="bg-neutral-900 rounded-[2.5rem] p-8 text-center text-white shadow-2xl border-b-8 border-yellow-400 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-white/5"></div>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-2">Total Paid Amount</p>
                <p className="text-5xl font-black tracking-tighter italic text-blue-400">${orderData.total}</p>
            </div>

            {/* Store Contact Support */}
            <div className="w-full flex justify-center items-center mt-6">
              <button onClick={() => window.open("https://t.me/vathana_trader", "_blank")}
                className=" bg-blue-100 p-4 rounded-2xl flex items-center justify-center gap-4 text-blue-600 border border-blue-100 animate-pulse hover:bg-blue-100 transition-all">
                <MessageCircle size={18} />
                <span className="text-[15px] font-black uppercase tracking-widest italic​ font-[KatamuyPro]">ទាក់ទងមកកាន់ហាង: 000 777 111
              </span>
              </button>
            </div>
          </div>
        </div>

        {/* --- ប៊ូតុងបញ្ជាខាងក្រៅ (Action Buttons) --- */}
        <div className="mt-8 space-y-4 print:hidden px-2">
          <button 
            onClick={handleScreenshot}
            className="w-full group flex items-center justify-center gap-4 h-16 bg-blue-600 text-white rounded-[1.5rem] font-black text-sm uppercase tracking-[0.1em] shadow-[0_20px_40px_-15px_rgba(37,99,235,0.4)] hover:bg-blue-700 transition-all active:scale-95"
          >
            <Camera size={24} className="group-hover:rotate-12 transition-transform"/> 
            Save Receipt to Gallery
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 h-14 bg-white border-2 border-slate-200 text-slate-600 rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-slate-50 active:scale-95 transition-all"
            >
              <Home size={18}/> Home
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 h-14 bg-neutral-800 text-white rounded-[1.5rem] font-black text-[11px] uppercase tracking-widest hover:bg-neutral-900 active:scale-95 transition-all"
            >
              <Download size={18}/> PDF
            </button>
          </div>
        </div>
      </div>

      {/* --- Exit Modal (ដូច ProductDetail) --- */}
      {showExitAlert && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[3rem] p-10 text-center shadow-2xl border-t-8 border-amber-500 relative overflow-hidden">
                <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={40} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 uppercase italic mb-3 tracking-tighter">កុំអាលចាកចេញ!</h2>
                <p className="text-slate-500 text-sm font-medium mb-8 leading-relaxed italic">
                    សូមមេត្តាថតរូបវិក្កយបត្រទុកជាភស្តុតាង ដើម្បីងាយស្រួលផ្ទៀងផ្ទាត់នៅពេលទទួលទំនិញ។
                </p>
                <div className="flex flex-col gap-3">
                    <button 
                        onClick={() => { setShowExitAlert(false); handleScreenshot(); }}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95"
                    >
                        ថតរូបរក្សាទុកឥឡូវនេះ
                    </button>
                    <button 
                        onClick={() => navigate('/')}
                        className="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest active:scale-95 transition-all"
                    >
                        បានថតហើយ ចាកចេញ
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;