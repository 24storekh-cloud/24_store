import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ១. ទាញយកទិន្នន័យពី LocalStorage បើមាន (ដើម្បីកុំឱ្យបាត់ទំនិញពេល Refresh page)
  const [cartItems, setCartItems] = useState(() => {
    try {
      const localData = localStorage.getItem('24store_cart');
      return localData ? JSON.parse(localData) : [];
    } catch (err) {
      return [];
    }
  });

  // ២. រក្សាទុកក្នុង LocalStorage រាល់ពេល cartItems ប្រែប្រួល
  useEffect(() => {
    localStorage.setItem('24store_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ៣. មុខងារបន្ថែមទំនិញ (Add / Increase)
  const addToCart = (product) => {
    if (!product || !product.id) return; // បញ្ឈប់បើគ្មាន ID

    setCartItems((prev) => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        // បើមានរួចហើយ ថែមចំនួន +1
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // បើមិនទាន់មាន ថែម Object ថ្មីចូល និងកំណត់ quantity: 1
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  // ៤. មុខងារបន្ថយចំនួនទំនិញ (Decrease)
  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  // ៥. មុខងារលុបទំនិញចេញពីកន្ត្រក (Remove)
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  // ៦. មុខងារលុបសម្អាតកន្ត្រកទាំងមូល (Clear Cart - ប្រើក្រោយពេល Checkout ជោគជ័យ)
  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('24store_cart');
  };

  // ៧. គណនាចំនួនទំនិញសរុប (Total Items Count)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      decreaseQuantity, 
      removeFromCart, 
      clearCart, 
      totalItems 
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Custom Hook សម្រាប់ងាយស្រួលហៅប្រើ
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};