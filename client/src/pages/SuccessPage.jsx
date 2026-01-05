import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas'; // Library សម្រាប់ថតរូប Screenshot
import { 
  CheckCircle2, Home, Download, Camera,
  User, Phone, MapPin, Package, Image as ImageIcon,
  AlertTriangle 
} from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitAlert, setShowExitAlert] = useState(false);
  const invoiceRef = useRef(null); // សម្គាល់តំបន់ដែលត្រូវថតរូប

  // ទាញទិន្នន័យពីការកុម្ម៉ង់ (Fallback ប្រសិនបើគ្មានទិន្នន័យ)
  const orderData = location.state?.order || {
    id: 'ORD-UNKNOWN',
    total: '0.00',
    productName: 'ទំនិញមិនស្គាល់',
    qty: 0,
    customerName: 'មិនមានឈ្មោះ',
    phone: 'មិនមានលេខ',
    address: 'មិនមានអាសយដ្ឋាន',
    payslip: null 
  };

  // បញ្ឈប់ការចាកចេញដោយអចេតនា
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // មុខងារ Screenshot & Save រូបភាពចូលក្នុងម៉ាស៊ីន
  const handleScreenshot = async () => {
    if (invoiceRef.current) {
      try {
        const canvas = await html2canvas(invoiceRef.current, {
          scale: 3, // កម្រិតច្បាស់ខ្លាំង
          useCORS: true,
          backgroundColor: "#ffffff",
          borderRadius: 40
        });
        
        const image = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = image;
        link.download = `Receipt-${orderData.id}.png`;
        link.click();
      } catch (err) {
        console.error("Screenshot failed:", err);
        alert("មិនអាចថតរូបបានទេ សូមប្រើការថត Screen ទូរស័ព្ទជំនួសវិញ!");
      }
    }
  };

  const handleGoHome = () => setShowExitAlert(true);
  const confirmExit = () => navigate('/');

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex flex-col items-center justify-center p-4 font-sans print:bg-white print:p-0">
      
      <div className="max-w-md w-full relative">
        
        {/* --- ផ្នែកដែលត្រូវថតរូប (Invoice Card) --- */}
        <div 
          ref={invoiceRef} 
          className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-white relative animate-in zoom-in-95 duration-500 print:shadow-none print:border-none"
        >
          {/* Header Area */}
          <div className="bg-blue-600 p-8 text-center text-white relative">
            <div className="w-20 h-20 bg-white rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-lg rotate-3">
              <CheckCircle2 size={40} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-black uppercase italic leading-none tracking-tighter">Order Confirmed!</h1>
            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest mt-2">Official Digital Receipt</p>
            
            {/* Cut line effect */}
            <div className="absolute -bottom-3 left-0 right-0 flex justify-around px-2 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-4 h-6 bg-white rounded-full shrink-0 lg:bg-[#F1F5F9] print:hidden"></div>
                ))}
            </div>
          </div>

          <div className="p-8 pt-10 space-y-6">
            {/* Order Identity */}
            <div className="flex justify-between items-center px-1">
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</p>
                    <p className="font-black text-slate-900 text-lg">#{orderData.id}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="font-bold text-slate-700 text-sm">{new Date().toLocaleDateString()}</p>
                </div>
            </div>

            {/* Customer & Delivery Info */}
            <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-3">
              <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <User size={12}/> Customer Info
              </h3>
              <div className="grid grid-cols-1 gap-2 text-sm">
                <div className="flex justify-between font-bold text-slate-800">
                    <span className="text-slate-400 font-medium italic">Name:</span>
                    <span>{orderData.customerName}</span>
                </div>
                <div className="flex justify-between font-bold text-slate-800">
                    <span className="text-slate-400 font-medium italic">Phone:</span>
                    <span>{orderData.phone}</span>
                </div>
                <div className="flex items-start gap-4 font-bold pt-2 border-t border-dashed border-slate-200">
                    <span className="text-slate-400 shrink-0"><MapPin size={14}/></span>
                    <span className="text-slate-700 text-[11px] leading-relaxed">{orderData.address}</span>
                </div>
              </div>
            </div>

            {/* Product Summary */}
            <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black">
                            {orderData.qty}x
                        </div>
                        <p className="font-black text-slate-800 uppercase italic text-[13px]">{orderData.productName}</p>
                    </div>
                    <p className="font-black text-blue-600">${orderData.total}</p>
                </div>
            </div>

            {/* Payment Proof (Payslip) */}
            {orderData.payslip && (
              <div className="space-y-3">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1">
                    <ImageIcon size={12}/> Payment Attachment
                </h3>
                <img 
                    src={orderData.payslip} 
                    alt="Payslip" 
                    className="w-full h-32 object-cover rounded-2xl border-2 border-slate-50" 
                />
              </div>
            )}

            {/* Total Amount Card */}
            <div className="bg-slate-900 rounded-[2rem] p-6 text-center text-white shadow-xl">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.3em] mb-1">Total Paid</p>
                <p className="text-4xl font-black tracking-tighter italic text-blue-400">${orderData.total}</p>
            </div>
          </div>
        </div>

        {/* --- ប៊ូតុងបញ្ជានៅខាងក្រៅ (មិនជាប់ក្នុងរូប Screenshot) --- */}
        <div className="mt-8 flex flex-col gap-4 print:hidden">
          
          {/* ប៊ូតុង Screenshot សំខាន់ជាងគេ */}
          <button 
            onClick={handleScreenshot}
            className="group flex items-center justify-center gap-3 h-16 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
          >
            <Camera size={22} className="group-hover:rotate-12 transition-transform"/> 
            Screenshot & Save
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleGoHome}
              className="flex items-center justify-center gap-2 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
            >
              <Home size={18}/> Home
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center justify-center gap-2 h-14 bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-900 transition-all"
            >
              <Download size={18}/> PDF
            </button>
          </div>
        </div>

        <p className="text-center mt-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em] print:hidden">
          Thank you for shopping • 24 STORE
        </p>
      </div>

      {/* --- Exit Warning Modal --- */}
      {showExitAlert && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800 uppercase italic mb-2">កុំអាលចាកចេញ!</h2>
                <p className="text-slate-500 text-sm font-medium mb-8">
                    តើបងបានថតរូបវិក្កយបត្រទុកហើយឬនៅ? សូមថតទុកដើម្បីជាភស្តុតាង។
                </p>
                <div className="space-y-3">
                    <button 
                        onClick={() => { setShowExitAlert(false); handleScreenshot(); }}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
                    >
                        ថតរូបឥឡូវនេះ
                    </button>
                    <button 
                        onClick={confirmExit}
                        className="w-full py-4 bg-white text-slate-400 rounded-2xl font-bold text-xs uppercase"
                    >
                        បានថតរួចហើយ ចាកចេញ
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default SuccessPage;