import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast'; // បន្ថែមសម្រាប់ Pop-up alert ស្អាតៗ

// --- Import Components ---
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // បន្ថែម Footer ប្រសិនបើមាន

// --- Import Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import SuccessPage from './pages/SuccessPage'; // ទំព័រជោគជ័យដែលទើបបង្កើត
// import AdminDashboard from './pages/AdminDashboard'; // ប្រសិនបើអ្នកមានទំព័រ Admin

// --- Import Provider ---
import { CartProvider } from './context/CartContext';

function App() {
  return (
    <CartProvider>
      <Router>
        {/* បន្ថែម Toaster នៅខាងលើបង្អស់ ដើម្បីបង្ហាញ Notification */}
        <Toaster position="top-center" reverseOrder={false} />

        <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-phetsarath selection:bg-blue-100">
          
          {/* ១. Navbar បង្ហាញនៅគ្រប់ទំព័រ */}
          <Navbar />

          {/* ២. តំបន់បង្ហាញខ្លឹមសារទំព័រ (Main Content Area) */}
          <main className="flex-grow">
            <Routes>
              {/* ទំព័រដើម */}
              <Route path="/" element={<Home />} />

              {/* ទំព័រតាមប្រភេទផលិតផល */}
              <Route path="/category/:slug" element={<Home />} />

              {/* ទំព័រព័ត៌មានលម្អិតផលិតផល (ដែលយើងបានធ្វើ Full Code អម្បាញ់មិញ) */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ទំព័រកន្ត្រកទំនិញ */}
              <Route path="/cart" element={<Cart />} />

              {/* ទំព័រ Checkout */}
              <Route path="/checkout" element={<Checkout />} />

              {/* ៣. ទំព័រជោគជ័យ (ក្រោយកុម្ម៉ង់រួច) */}
              <Route path="/success" element={<SuccessPage />} />

              {/* ៤. ទំព័រ Admin (សម្រាប់គ្រប់គ្រងស្តុក និង Order) */}
              {/* <Route path="/admin-control-panel" element={<AdminDashboard />} /> */}

              {/* ទំព័រ 404 (Optional) */}
              <Route path="*" element={
                <div className="h-[60vh] flex flex-col items-center justify-center italic font-black text-slate-300 uppercase">
                  <h2 className="text-4xl">404</h2>
                  <p>Page Not Found</p>
                </div>
              } />
            </Routes>
          </main>

          {/* ៥. Footer ផ្នែកខាងក្រោមនៃវេបសាយ */}
          <Footer />

        </div>
      </Router>
    </CartProvider>
  );
}

export default App;