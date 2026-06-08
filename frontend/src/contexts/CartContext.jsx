import React, { createContext, useContext, useEffect, useState, useMemo } from "react";

const CartContext = createContext({
  items: [],
  add: () => {},
  remove: () => {},
  update: () => {},
  clear: () => {},
  count: 0,
  subtotal: 0,
});

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(localStorage.getItem("sos_cart") || "[]"); } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem("sos_cart", JSON.stringify(items));
  }, [items]);

  const add = (item) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.item_id === item.item_id && i.item_type === item.item_type);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], quantity: copy[idx].quantity + (item.quantity || 1) };
        return copy;
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const remove = (item_id, item_type) => {
    setItems((prev) => prev.filter((i) => !(i.item_id === item_id && i.item_type === item_type)));
  };

  const update = (item_id, item_type, quantity) => {
    if (quantity <= 0) return remove(item_id, item_type);
    setItems((prev) =>
      prev.map((i) =>
        i.item_id === item_id && i.item_type === item_type ? { ...i, quantity } : i
      )
    );
  };

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(() => {
    const count = items.reduce((s, i) => s + i.quantity, 0);
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    return { count, subtotal };
  }, [items]);

  return (
    <CartContext.Provider value={{ items, add, remove, update, clear, count, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
