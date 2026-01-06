import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../apiConfig';

const Login = ({ setToken }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('adminToken', data.token);
        setToken(data.token);
        toast.success("ស្វាគមន៍មកកាន់ប្រព័ន្ធគ្រប់គ្រង!", { 
          icon: '🚀',
          style: { borderRadius: '15px', background: '#333', color: '#fff' }
        });
      } else {
        toast.error(data.message || "ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!");
      }
    } catch (error) {
      toast.error("មិនអាចភ្ជាប់ទៅកាន់ Server បានទេ!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-[480px] relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="bg-white/10 backdrop-blur-2xl rounded-[3rem] shadow-2xl border border-white/10 p-10 md:p-14">
          
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-blue-500/30 rotate-3 hover:rotate-0 transition-all duration-500 group">
                <ShieldCheck size={48} strokeWidth={2} className="group-hover:scale-110 transition-transform" />
              </div>
              <Sparkles className="absolute -top-2 -right-2 text-blue-400 animate-bounce" size={24} />
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              Admin <span className="text-blue-500">Portal</span>
            </h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mt-4 opacity-70">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-7">
            {/* Username Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Username</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <User size={20} />
                </div>
                <input 
                  required
                  type="text"
                  className="w-full pl-16 pr-6 py-5 bg-white/5 rounded-[1.5rem] outline-none font-bold border border-white/5 focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-600"
                  placeholder="Admin Username"
                  onChange={e => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-[0.2em]">Secret Key</label>
              <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={20} />
                </div>
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-16 pr-16 py-5 bg-white/5 rounded-[1.5rem] outline-none font-bold border border-white/5 focus:border-blue-500/50 focus:bg-white/10 transition-all text-white placeholder:text-slate-600"
                  placeholder="••••••••••••"
                  onChange={e => setCredentials({...credentials, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button 
              disabled={loading}
              type="submit"
              className="w-full py-6 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-xl shadow-blue-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-4 uppercase italic tracking-widest mt-10 overflow-hidden relative group"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer"></div>
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>Access Dashboard <ShieldCheck size={20} /></>
              )}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
               <span className="text-[9px] font-black text-slate-500 uppercase">System Secure</span>
            </div>
            <span className="text-[9px] font-black text-slate-600 uppercase">v2.6.4 Build 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;