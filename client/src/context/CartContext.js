import React, { createContext, useState, useContext, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // ទាញយកទិន្នន័យពី LocalStorage បើមាន (ដើម្បីកុំឱ្យបាត់ទំនិញពេល Refresh page)
  const [cartItems, setCartItems] = useState(() => {
    const localData = localStorage.getItem('24store_cart');
    return localData ? JSON.parse(localData) : [];
  });

  // រក្សាទុកក្នុង LocalStorage រាល់ពេល cartItems ប្រែប្រួល
  useEffect(() => {
    localStorage.setItem('24store_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // ១. មុខងារបន្ថែមទំនិញ (Add / Increase)
  const addToCart = (product) => {
    setCartItems((prev) => {
      const isExist = prev.find(item => item.id === product.id);
      if (isExist) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: product.quantity || 1 }];
    });
  };

  // ២. មុខងារបន្ថយចំនួនទំនិញ (Decrease)
  const decreaseQuantity = (id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
      )
    );
  };

  // ៣. មុខងារលុបទំនិញចេញពីកន្ត្រក (Remove)
  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter(item => item.id !== id));
  };

  // ៤. មុខងារលុបសម្អាតកន្ត្រកទាំងមូល (Clear Cart - ប្រើក្រោយពេល Checkout ជោគជ័យ)
  const clearCart = () => {
    setCartItems([]);
  };

  // ៥. គណនាចំនួនទំនិញសរុប (Total Items Count)
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
export const useCart = () => useContext(CartContext);