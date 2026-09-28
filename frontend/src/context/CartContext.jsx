import React, { createContext, useContext, useMemo, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = (product, quantity = 1, variant = null) => {
    setItems((prev) => {
      const key = variant ? `${product._id}-${variant._id}` : product._id;
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: i.quantity + quantity } : i));
      }
      return [
        ...prev,
        {
          key,
          product,
          productId: product._id,
          variantId: variant?._id || null,
          variantLabel: variant ? `${variant.name}: ${variant.value}` : null,
          name: product.name,
          image: product.images?.[0],
          sku: variant?.sku || product.sku,
          brand: product.brand,
          price: variant ? variant.price : product.price,
          quantity
        }
      ];
    });
    setIsOpen(true);
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => i.key !== key));

  const updateQty = (key, quantity) => {
    if (quantity < 1) return;
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, quantity } : i)));
  };

  const clearCart = () => setItems([]);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);
  const itemCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{
      items, isOpen, setIsOpen, addItem, removeItem, updateQty, clearCart, subtotal, itemCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
