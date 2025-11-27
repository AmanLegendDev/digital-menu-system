"use client";

import { useEffect, useState } from "react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // -----------------------------
  // NEW ORDER MEMORY SYSTEM
  // -----------------------------
  function markAsSeen(orderId) {
    let seen = JSON.parse(localStorage.getItem("seenOrders")) || [];

    if (!seen.includes(orderId)) {
      seen.push(orderId);
      localStorage.setItem("seenOrders", JSON.stringify(seen));
    }
  }

  function isNewOrder(orderId) {
    const seen = JSON.parse(localStorage.getItem("seenOrders")) || [];
    return !seen.includes(orderId);
  }

  // -----------------------------
  // LOAD ORDERS
  // -----------------------------
  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.log("Orders Fetch Error:", err);
    }
    setLoading(false);
  }

  // -----------------------------
  // DELETE ORDER
  // -----------------------------
  async function deleteOrder(id) {
    try {
      await fetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      console.log("Delete error:", err);
    }
  }

  // -----------------------------
  // GROUP ORDERS
  // -----------------------------
  function groupOrders(orders) {
    const today = [];
    const yesterday = [];
    const older = [];

    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();

    orders.forEach((o) => {
      const date = new Date(o.createdAt);
      const day = date.getDate();
      const month = date.getMonth();
      const year = date.getFullYear();

      const isToday =
        day === todayDay && month === todayMonth && year === todayYear;
      const isYesterday =
        day === todayDay - 1 && month === todayMonth && year === todayYear;

      if (isToday) today.push(o);
      else if (isYesterday) yesterday.push(o);
      else older.push(o);
    });

    return { today, yesterday, older };
  }

  const { today, yesterday, older } = groupOrders(orders);

  // -----------------------------
  // ORDER CARD COMPONENT
  // -----------------------------
  function OrderCard({ o }) {
    const isNew = isNewOrder(o._id);

    return (
      <div
        key={o._id}
        className="relative bg-[#111] border border-gray-800 rounded-xl p-5 shadow hover:shadow-xl hover:border-[#ff6a3d] transition cursor-pointer"
        onClick={() => {
          markAsSeen(o._id);
          setSelectedOrder(o);
        }}
      >
        {/* NEW BADGE */}
        {isNew && (
          <span className="absolute bottom-3 right-4 bg-green-600 text-white text-xs px-2 py-1 rounded-full">
            NEW
          </span>
        )}

        {/* DELETE BUTTON */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setDeleteConfirm(o);
          }}
          className="absolute right-3 top-3 text-red-400 hover:text-red-200 text-lg"
        >
          🗑️
        </button>

        <div>
          <p className="text-sm text-gray-400 mb-2">
            {new Date(o.createdAt).toLocaleString()}
          </p>

          <h2 className="text-xl font-bold mb-2 text-[#ff6a3d]">
            Table {o.table}
          </h2>

          <p className="text-gray-300 mb-1">{o.totalQty} items</p>
          <p className="font-bold text-lg text-white">₹{o.totalPrice}</p>
        </div>
      </div>
    );
  }

  // -----------------------------
  // UI RETURN
  // -----------------------------
  return (
    <div className="p-6 text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Orders</h1>
        <p className="text-gray-400 mt-1">All customer orders in real-time</p>
      </div>

      {loading && (
        <div className="text-center py-10 text-gray-400 text-lg">
          Loading orders...
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="text-center py-12 text-gray-500 text-lg">
          No orders yet 😶
        </div>
      )}

      {/* TODAY */}
      {today.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-6 mb-3">Today</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {today.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* YESTERDAY */}
      {yesterday.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-3">Yesterday</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {yesterday.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* OLDER */}
      {older.length > 0 && (
        <>
          <h2 className="text-xl font-bold mt-10 mb-3">Older Orders</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {older.map((o) => (
              <OrderCard key={o._id} o={o} />
            ))}
          </div>
        </>
      )}

      {/* ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-lg rounded-xl border border-gray-800 p-6 relative shadow-xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute right-4 top-3 text-gray-400 hover:text-white text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-[#ff6a3d]">
              Table {selectedOrder.table}
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              {new Date(selectedOrder.createdAt).toLocaleString()}
            </p>

            <div className="h-[1px] bg-gray-700 mb-4" />

            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scroll">
              {selectedOrder.items.map((item) => (
                <div
                  key={item._id}
                  className="flex justify-between border-b border-gray-800 pb-2"
                >
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-400">
                      {item.qty} × ₹{item.price}
                    </p>
                  </div>
                  <p className="font-semibold text-[#ff6a3d]">
                    ₹{item.qty * item.price}
                  </p>
                </div>
              ))}
            </div>

            <div className="h-[1px] bg-gray-700 my-4" />

            <div className="flex justify-between text-lg font-bold">
              <p>Total</p>
              <p>₹{selectedOrder.totalPrice}</p>
            </div>

            {selectedOrder.note && (
              <p className="mt-3 p-3 bg-gray-900 rounded-lg text-gray-300 text-sm">
                <span className="font-semibold text-white">Note:</span>{" "}
                {selectedOrder.note}
              </p>
            )}

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full mt-6 bg-[#ff6a3d] py-3 rounded-xl font-semibold text-white hover:brightness-110 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur flex items-center justify-center z-50">
          <div className="bg-[#111] w-[90%] max-w-sm rounded-xl border border-gray-800 p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-red-400">
              Delete this order?
            </h2>

            <p className="text-gray-300 mb-6">
              Are you sure you want to delete order for{" "}
              <b>Table {deleteConfirm.table}</b>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => deleteOrder(deleteConfirm._id)}
                className="flex-1 bg-red-600 py-2 rounded-lg text-white font-semibold"
              >
                Yes, delete
              </button>

              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 py-2 rounded-lg text-white font-semibold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
