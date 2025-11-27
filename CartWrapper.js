"use client";

import { CartProvider } from "./app/context/CartContext";

export default function CartWrapper({ children }) {
  return <CartProvider>{children}</CartProvider>;
}
