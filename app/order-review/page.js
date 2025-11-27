"use client";

import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderReviewPage() {
  const { cart } = useCart();
  const router = useRouter();

  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const [table, setTable] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  // ---------------------------
  // 🎵 SOUND PLAYER
  // ---------------------------
function playDingSound() {
  const audio = new Audio("/sounds/order-ding.mp3");
  audio.volume = 1;

  audio.play().catch((e) => {
    console.log("Sound blocked, retrying...");

    // Fallback retry
    const retry = new Audio("/sounds/order-ding.mp3");
    retry.volume = 1;
    retry.play().catch(() => {});
  });
}



  // ---------------------------
  // 🛎 PLACE ORDER
  // ---------------------------
  async function placeOrder() {
    if (!table) {
      alert("Please enter table number!");
      return;
    }

    const orderData = {
      items: cart,
      totalQty,
      totalPrice,
      table,
      note,
      createdAt: new Date(),
    };

    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (data.success) {
      const finalOrder = { ...orderData, _id: data.order._id };
      localStorage.setItem("latestOrder", JSON.stringify(finalOrder));

      // ---------------------------
      // 📳 VIBRATION + SOUND
      // ---------------------------
      if (navigator.vibrate) {
        navigator.vibrate([120, 60, 120]); // smooth double buzz
      }

      playDingSound();

      router.push("/order-success");
    } else {
      alert("Order failed. Try again!");
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] px-4 py-6 pb-28 text-black">
      <h1 className="text-3xl font-extrabold text-[#111] tracking-tight">
        Review Your Order
      </h1>

      <p className="text-gray-600 text-sm mt-1 mb-4">
        Please confirm your items before placing the order.
      </p>

      <h2 className="text-lg font-semibold mt-2 mb-2">Order Summary</h2>

      <div className="h-[1px] bg-gray-300/60 mb-4" />

      {/* ITEMS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {cart.map((item) => (
          <div
            key={item._id}
            className="bg-white rounded-xl shadow-sm border hover:shadow-md transition p-3 flex flex-col"
          >
            <img
              src={item.image}
              className="w-full h-24 rounded-lg object-cover"
            />

            <h2 className="font-semibold text-[15px] mt-2 line-clamp-1">
              {item.name}
            </h2>

            <p className="text-gray-600 text-sm mt-1">
              {item.qty} × ₹{item.price}
            </p>

            <p className="font-bold text-[#ff6a3d] text-right mt-auto">
              ₹{item.qty * item.price}
            </p>
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Your Details</h2>
      <div className="h-[1px] bg-gray-300/60 mb-4" />

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm mb-3">
          {error}
        </div>
      )}

      {/* TABLE INPUT */}
      <div className="mb-5">
        <label className="font-semibold text-sm block mb-1">
          Table Number <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          placeholder="Enter your table number"
          value={table}
          onChange={(e) => {
            setError("");
            setTable(e.target.value);
          }}
          className="w-full p-3 rounded-lg border bg-white shadow-sm focus:ring-2 focus:ring-[#ff6a3d] outline-none transition"
        />
      </div>

      {/* NOTE INPUT */}
      <label className="font-semibold text-sm block mb-1">Note (Optional)</label>
      <textarea
        placeholder="Any instructions? (extra cheese, less spicy...)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full p-3 rounded-lg border bg-white shadow-sm min-h-[90px] focus:ring-2 focus:ring-[#ff6a3d] outline-none transition"
      />

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur shadow-[0_-2px_12px_rgba(0,0,0,0.15)] py-4 px-5 border-t flex justify-between items-center z-50">
        <p className="font-semibold text-[16px]">
          {totalQty} items • ₹{totalPrice}
        </p>

        <button
          onClick={placeOrder}
          className="bg-gradient-to-r from-[#ff6a3d] to-[#ff8a3d] text-white px-7 py-2.5 rounded-full font-semibold shadow-lg active:scale-95 transition"
        >
          Place Order
        </button>
      </div>
    </div>
  );
}
