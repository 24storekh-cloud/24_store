import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, Home, ShoppingBag, Send, ArrowRight, Download } from 'lucide-react';

const SuccessPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state?.order || {
    id: 'ORD-' + Math.floor(Math.random() * 100000),
    total: '0.00',
    date: new Date().toLocaleDateString()
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Card ធំ */}
        <div className="bg-white rounded-[3rem] shadow-2xl shadow-blue-100 overflow-hidden border border-white relative animate-in zoom-in-95 duration-500">
          
          {/* បែបផែន Background តិចៗ */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50/50 to-transparent"></div>

          <div className="p-8 pt-12 text-center relative z-10">
            {/* Icon ជោគជ័យ */}
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-200 rotate-12 animate-bounce">
              <CheckCircle2 size={48} className="text-white -rotate-12" />
            </div>

            <h1 className="text-3xl font-black text-slate-900 uppercase italic leading-none">Order Success!</h1>
            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-3">ការកុម្ម៉ង់ត្រូវបានបញ្ជូនទៅកាន់ហាង</p>
            
            {/* ព័ត៌មានវិក្កយបត្រសង្ខេប */}
            <div className="mt-8 bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-dashed border-slate-200">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</span>
                <span className="font-bold text-slate-900">#{orderData.id}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Paid</span>
                <span className="text-2xl font-black text-blue-600">${orderData.total}</span>
              </div>

              <div className="pt-2">
                <div className="bg-blue-100/50 rounded-xl py-2 px-4 inline-flex items-center gap-2 text-blue-600">
                  <span className="text-[10px] font-black uppercase italic">Status: Processing</span>
                  <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* ការណែនាំ */}
            <div className="mt-8 space-y-3">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                សូមថតរូបអេក្រង់ (Screenshot) វិក្កយបត្រនេះ <br/> ដើម្បីជាភស្តុតាងក្នុងការទទួលទំនិញ។
              </p>
              <button 
                onClick={() => window.print()}
                className="flex items-center gap-2 mx-auto text-blue-600 font-black text-[10px] uppercase tracking-widest hover:opacity-70 transition-opacity"
              >
                <Download size={14}/> Save as Receipt
              </button>
            </div>
          </div>

          {/* ប៊ូតុងសកម្មភាព */}
          <div className="p-8 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/')}
              className="flex items-center justify-center gap-2 h-14 bg-white border border-slate-200 text-slate-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
            >
              <Home size={18}/> Home
            </button>
            <button 
              onClick={() => window.open('https://t.me/your_telegram_username', '_blank')}
              className="flex items-center justify-center gap-2 h-14 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95"
            >
              Contact <Send size={18}/>
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]">
          Thank you for shopping with 24 Store
        </p>
      </div>
    </div>
  );
};

export default SuccessPage;