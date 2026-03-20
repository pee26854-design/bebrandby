import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_BASE, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function LastOrder() {
  const STORAGE_KEYS = useMemo(
    () => ({
      lastOrderId: "bbb_last_order_id",
      orders: "bbb_orders",
    }),
    []
  );

  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [lastOrderId, setLastOrderId] = useState(() => localStorage.getItem(STORAGE_KEYS.lastOrderId) || "");

  function ensureLastOrderId(mappedOrders) {
    if (!lastOrderId && mappedOrders[0]) {
      setLastOrderId(mappedOrders[0].id);
      localStorage.setItem(STORAGE_KEYS.lastOrderId, mappedOrders[0].id);
    }
  }

  function loadGuestOrders() {
    const guestOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || "[]");
    setOrders(guestOrders);
    ensureLastOrderId(guestOrders);
    setError("");
  }

  async function loadOrders() {
    const latestUser = getCurrentUser();
    setCurrentUser(latestUser);

    if (!latestUser) {
      loadGuestOrders();
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/orders/me`, { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to load orders");
        setOrders([]);
        return;
      }

      const mappedOrders = (data.data || []).map((o) => {
        const delivery = typeof o.delivery_json === "string" ? JSON.parse(o.delivery_json || "{}") : o.delivery_json || {};
        return {
          id: `ORD-${o.id}`,
          date: o.created_at?.slice(0, 10) || "",
          total: Number(o.total || 0),
          status: o.status,
          items: o.items || [],
          shipping: delivery.shippingMethod || "Standard",
          tracking: o.tracking || "Pending",
        };
      });
      setOrders(mappedOrders);
      ensureLastOrderId(mappedOrders);
      setError("");
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  const lastOrder = orders.find((o) => o.id === lastOrderId) || orders[0];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          Loading last order...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5] p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-2xl border border-rose-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold font-brand">Last Order</h1>
          <Link to={currentUser ? "/account" : "/orders"} className="text-sm text-rose-600 hover:underline">
            {currentUser ? "Go to My Account" : "Go to Orders"}
          </Link>
        </div>

        {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}

        {!lastOrder && (
          <div className="space-y-3">
            <p className="text-gray-600">
              {currentUser
                ? "No last order selected yet. Please choose one from your orders."
                : "No guest order found yet on this device."}
            </p>
            <div className="flex gap-2">
              <Link to={currentUser ? "/orders" : "/shop"} className="px-4 py-2 bg-rose-600 text-white rounded-lg">
                {currentUser ? "View all orders" : "Go to Shop"}
              </Link>
              <Link to="/" className="px-4 py-2 border border-rose-200 rounded-lg">
                Back to home
              </Link>
            </div>
          </div>
        )}

        {lastOrder && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">Order ID</div>
                <div className="font-semibold">{lastOrder.id}</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Total</div>
                <div className="font-semibold">ß{Number(lastOrder.total || 0).toLocaleString()}</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              Date: {lastOrder.date || "-"} • Status: {lastOrder.status || "Processing"}
            </div>

            <div className="border border-rose-100 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-2">Items</div>
              <ul className="text-sm text-gray-700 space-y-1">
                {(lastOrder.items || []).map((item, idx) => (
                  <li key={`${lastOrder.id}-${idx}`}>
                    {item.qty}x {item.name} • ß{Number(item.price || 0).toLocaleString()}
                  </li>
                ))}
              </ul>
              <div className="text-xs text-gray-500 mt-3">
                Shipping: {lastOrder.shipping || "Standard"} • Tracking: {lastOrder.tracking || "Pending"}
              </div>
            </div>

            <div className="flex gap-2">
              <Link to="/shop" className="px-4 py-2 bg-rose-600 text-white rounded-lg">
                Shop again
              </Link>
              <Link to="/orders" className="px-4 py-2 border border-rose-200 rounded-lg">
                View all orders
              </Link>
              <button onClick={loadOrders} className="px-4 py-2 border border-rose-200 rounded-lg">
                Refresh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
