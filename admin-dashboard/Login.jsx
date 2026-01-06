import React, { useState } from 'react';
import { Lock, User, Eye, EyeOff, ShieldCheck, Loader2 } from 'lucide-react';
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
        toast.success("ស្វាគមន៍ការត្រឡប់មកវិញ!", { icon: '👋' });
      } else {
        toast.error(data.message || "ឈ្មោះអ្នកប្រើ ឬលេខសម្ងាត់មិនត្រឹមត្រូវ!");
      }
    } catch (error) {
      toast.error("មានបញ្ហាក្នុងការភ្ជាប់ទៅកាន់ Server!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6 relative overflow-hidden">
      {/* ផ្ទៃ Background លម្អ */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100 rounded-full blur-[120px] opacity-50"></div>

      <div className="w-full max-w-[450px] relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-blue-200/50 border border-white p-10 md:p-12">
          
          {/* Logo/Header */}
          <div className="text-center mb-10">
            <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-blue-200 rotate-3 group hover:rotate-0 transition-transform duration-500">
              <ShieldCheck size={40} strokeWidth={2.5} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 uppercase italic tracking-tighter">Admin Portal</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mt-3">Authorized Access Only</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Username</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <User size={18} />
                </div>
                <input 
                  required
                  type="text"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-slate-700"
                  placeholder="Enter username"
                  onChange={e => setCredentials({...credentials, username: e.target.value})}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-2 tracking-widest">Password</label>
              <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
                  <Lock size={18} />
                </div>
                <input 
                  required
                  type={showPassword ? "text" : "password"}
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 rounded-2xl outline-none font-bold border-2 border-transparent focus:border-blue-500 focus:bg-white transition-all text-slate-700"
                  placeholder="••••••••"
                  onChange={e => setCredentials({...credentials, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              disabled={loading}
              type="submit"
              className="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-lg hover:bg-blue-700 shadow-2xl shadow-blue-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 uppercase italic tracking-widest mt-8"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Sign In Securely"}
            </button>
          </form>

          <p className="text-center text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-10">
            System encrypted • v2.6.4
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;