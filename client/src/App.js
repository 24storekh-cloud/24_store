import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// --- Import Components ---
import Navbar from './components/Navbar';

// --- Import Pages ---
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';

// --- Import Provider (សម្រាប់គ្រប់គ្រងកន្ត្រកទំនិញ) ---
import { CartProvider } from './context/CartContext';

/**
 * App Component
 * ជាបេះដូងនៃវេបសាយ 24 STORE
 */
function App() {
  return (
    // ១. ស្រោបដោយ CartProvider ដើម្បីឱ្យគ្រប់ទំព័រអាចប្រើប្រាស់មុខងារ Add to Cart
    <CartProvider>
      <Router>
        {/* ២. រចនាសម្ព័ន្ធធំ (Main Layout) */}
        <div className="min-h-screen bg-gray-50 flex flex-col font-phetsarath selection:bg-blue-100">
          
          {/* Header & Category Bar បង្ហាញនៅគ្រប់ទំព័រទាំងអស់ */}
          <Navbar />

          {/* ៣. តំបន់បង្ហាញខ្លឹមសារទំព័រ (Main Content Area) */}
          <main className="flex-grow">
            <Routes>
              {/* ទំព័រដើម (បង្ហាញផលិតផលទាំងអស់) */}
              <Route path="/" element={<Home />} />

              {/* ទំព័រតាមប្រភេទផលិតផល (Filtered by Category) */}
              <Route path="/category/:slug" element={<Home />} />

              {/* ទំព័រព័ត៌មានលម្អិតផលិតផល */}
              <Route path="/product/:id" element={<ProductDetail />} />

              {/* ទំព័រកន្ត្រកទំនិញ */}
              <Route path="/cart" element={<Cart />} />

              {/* ទំព័រ Checkout បំពេញព័ត៌មានផ្ញើទៅ Telegram */}
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>

          {/* ៤. Footer ផ្នែកខាងក្រោមនៃវេបសាយ */}

        </div>
      </Router>
    </CartProvider>
  );
}

// ៥. Export App ដើម្បីឱ្យ index.js អាចដំណើរការបាន
export default App;