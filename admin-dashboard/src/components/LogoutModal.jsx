// src/components/LogoutModal.jsx
import React from 'react';
import { LogOut, X } from 'lucide-react';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl p-8 text-center animate-in zoom-in-95 duration-300">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors">
          <X size={20} />
        </button>

        <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-500 mx-auto mb-6">
          <LogOut size={30} />
        </div>

        <h3 className="text-xl font-black text-slate-800 uppercase italic">Confirm Logout</h3>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-2 mb-8">
          តើអ្នកពិតជាចង់ចាកចេញមែនទេ?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="py-4 rounded-2xl bg-slate-50 text-slate-500 font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
            Cancel
          </button>
          <button onClick={onConfirm} className="py-4 rounded-2xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest hover:bg-rose-600 transition-all shadow-lg shadow-rose-200">
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;