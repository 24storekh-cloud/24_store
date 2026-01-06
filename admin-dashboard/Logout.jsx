import React from 'react';
import { LogOut, X, ShieldAlert } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      {/* ផ្ទៃខាងក្រោយស្រអាប់ */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* ប្រអប់ Modal */}
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300 border border-slate-100">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6 shadow-inner">
          <LogOut size={32} strokeWidth={2.5} />
        </div>

        <h3 className="text-2xl font-black text-slate-800 uppercase italic leading-tight">Confirm Logout</h3>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-3 mb-8 px-4">
          តើអ្នកពិតជាចង់ចាកចេញពីប្រព័ន្ធគ្រប់គ្រងនេះមែនទេ?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-rose-100 hover:bg-rose-600 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            Yes, Log Out
          </button>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
          <ShieldAlert size={10} /> Secure session termination
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;