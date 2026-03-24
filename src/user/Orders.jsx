import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function Orders() {
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

  function loadGuestOrders() {
    const guestOrders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || "[]");
    setOrders(guestOrders);
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
      const res = await import(`${API_URL}/orders/me`, { headers: { ...getAuthHeaders() } });
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

  function markAsLastOrder(orderId) {
    setLastOrderId(orderId);
    localStorage.setItem(STORAGE_KEYS.lastOrderId, orderId);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          Loading orders...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-sm">
          <div className="p-6 text-white" style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">BeBrandBy</div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand">Orders</h1>
                <p className="text-white/90 text-sm mt-2">
                  {currentUser ? "All orders in your account" : "Guest checkout orders saved on this device"}
                </p>
              </div>
              <div className="bg-white/15 px-4 py-2 rounded-lg text-sm">{currentUser ? "Member" : "Guest"} orders: {orders.length}</div>
            </div>
          </div>

          <div className="p-6 bg-white">
            {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}

            <div className="space-y-3">
              {orders.map((o) => (
                <div key={o.id} className="p-4 border border-rose-100 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{o.id}</div>
                      <div className="text-sm text-gray-500">
                        {o.date} � �{Number(o.total || 0).toLocaleString()}
                      </div>
                    </div>
                    <div className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700">{o.status}</div>
                  </div>

                  <div>
                    <div className="text-xs text-gray-500">Items</div>
                    <ul className="text-sm text-gray-600">
                      {(o.items || []).map((item, idx) => (
                        <li key={`${o.id}-${idx}`}>
                          {item.qty}x {item.name} � �{Number(item.price || 0).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                    <div className="text-xs text-gray-500 mt-2">
                      Shipping: {o.shipping || "Standard"} � Tracking: {o.tracking || "Pending"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => markAsLastOrder(o.id)}
                      className={`text-sm px-3 py-1 border rounded-lg ${
                        lastOrderId === o.id ? "border-rose-400 bg-rose-50 text-rose-700" : "border-rose-200 hover:bg-rose-50"
                      }`}
                    >
                      {lastOrderId === o.id ? "Selected as last order" : "Set as last order"}
                    </button>
                    <Link to="/last-order" className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50">
                      View Last Order
                    </Link>
                    <button onClick={loadOrders} className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50">
                      Refresh
                    </button>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-gray-500">
                  {currentUser ? "No orders found in your account yet." : "No guest orders found on this device yet."}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {currentUser ? (
            <>
              <Link to="/account" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">My Account</div>
                <div className="font-semibold mt-1">Manage account overview</div>
              </Link>
              <Link to="/personal-info" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">Personal Info</div>
                <div className="font-semibold mt-1">Edit your profile</div>
              </Link>
              <Link to="/my-addresses" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">My Addresses</div>
                <div className="font-semibold mt-1">Manage saved addresses</div>
              </Link>
            </>
          ) : (
            <>
              <Link to="/shop" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">Shop</div>
                <div className="font-semibold mt-1">Continue shopping</div>
              </Link>
              <Link to="/cart" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">Cart</div>
                <div className="font-semibold mt-1">Manage your basket</div>
              </Link>
              <Link to="/" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
                <div className="text-sm text-gray-500">Home</div>
                <div className="font-semibold mt-1">Go to homepage</div>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
