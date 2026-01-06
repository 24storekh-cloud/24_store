import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// --- Import Components ---
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop'; // ជំនួយការ Scroll ទៅលើវិញពេលប្តូរទំព័រ

// --- Import Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SuccessPage from './pages/SuccessPage';

// --- Import Provider (សំខាន់បំផុតសម្រាប់ Add to Cart) ---
import { CartProvider } from './context/CartContext';

function App() {
  return (
    // ១. CartProvider ត្រូវស្រោប Router ដើម្បីឱ្យគ្រប់ Route ស្គាល់ Cart ទាំងអស់
    <CartProvider>
      <Router>
        {/* ២. ScrollToTop ជួយឱ្យពេលចុចដូរទំព័រ វារត់ទៅលើបំផុតវិញ */}
        <ScrollToTop />

        {/* ៣. Toaster សម្រាប់បង្ហាញសារ Notification ពេល Add ទំនិញ */}
        <Toaster 
          position="top-center" 
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: '1.5rem',
              background: '#1e293b',
              color: '#fff',
              fontSize: '14px',
            },
          }}
        />

        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
          
          {/* ៤. Navbar នៅខាងលើគេជានិច្ច */}
          <Navbar />

          {/* ៥. តំបន់បង្ហាញខ្លឹមសារទំព័រ (Main Content) */}
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/category/:slug" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/success" element={<SuccessPage />} />
              
              {/* ទំព័រ 404 ករណីរក Link មិនឃើញ */}
              <Route path="*" element={
                <div className="py-20 text-center uppercase tracking-widest text-slate-400">
                  <h2 className="text-6xl font-black opacity-20">404</h2>
                  <p>រកមិនឃើញទំព័រឡើយ</p>
                  <a href="/" className="mt-4 inline-block px-6 py-2 bg-blue-600 text-white rounded-xl text-xs">ត្រឡប់ទៅដើម</a>
                </div>
              } />
            </Routes>
          </main>

          {/* ៦. Footer នៅខាងក្រោមគេជានិច្ច */}
          <Footer />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;