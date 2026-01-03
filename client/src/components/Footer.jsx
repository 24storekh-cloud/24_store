import React from 'react';
import { Facebook, Instagram, Phone, Mail, MapPin, Send, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Section 1: ព័ត៌មានហាង */}
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-white italic tracking-tighter">24 STORE</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              យើងគឺជាហាងលក់ទំនិញអនឡាញឈានមុខគេ ដែលផ្តល់ជូននូវផលិតផលមានគុណភាពខ្ពស់ 
              និងតម្លៃសមរម្យបំផុតសម្រាប់អតិថិជនគ្រប់រូប។
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-blue-600 hover:text-white transition">
                <Facebook size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-pink-600 hover:text-white transition">
                <Instagram size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-sky-500 hover:text-white transition">
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          {/* Section 2: តំណភ្ជាប់រហ័ស */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">តំណភ្ជាប់រហ័ស</h3>
            <ul className="space-y-4 text-sm">
              <li><Link to="/" className="hover:text-blue-400 transition">ទំព័រដើម</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition">ផលិតផលថ្មីៗ</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition">ការបញ្ចុះតម្លៃ</Link></li>
              <li><Link to="#" className="hover:text-blue-400 transition">អំពីយើង</Link></li>
            </ul>
          </div>

          {/* Section 3: ទំនាក់ទំនង */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">ទំនាក់ទំនង</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 shrink-0" />
                <span>ផ្លូវលេខ ២៧១, សង្កាត់ទឹកថ្លា, ខណ្ឌសែនសុខ, រាជធានីភ្នំពេញ</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 shrink-0" />
                <span>+855 12 345 678 / 098 765 432</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 shrink-0" />
                <span>support@24store.com</span>
              </li>
            </ul>
          </div>

          {/* Section 4: ព្រឹត្តិបត្រព័ត៌មាន */}
          <div>
            <h3 className="text-lg font-bold text-white mb-6">ទទួលព័ត៌មានថ្មីៗ</h3>
            <p className="text-sm text-slate-400 mb-4">ចុះឈ្មោះដើម្បីទទួលបានការផ្តល់ជូនពិសេសពីយើងខ្ញុំ។</p>
            <div className="relative">
              <input 
                type="email" 
                placeholder="អ៊ីមែលរបស់អ្នក..." 
                className="w-full bg-slate-800 border-none rounded-xl py-3 px-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
              <button className="absolute right-2 top-1.5 p-1.5 bg-blue-600 rounded-lg hover:bg-blue-500 transition">
                <Send size={16} className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* បន្ទាត់ខណ្ឌ និង Copyright */}
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
          <p>© 2024 24 STORE. រក្សាសិទ្ធិគ្រប់យ៉ាង។</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;