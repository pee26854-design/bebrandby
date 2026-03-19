import React, { useEffect, useMemo, useState } from "react";
import { API_BASE, getAuthHeaders, getCurrentUser } from "../utils/auth";

function parseJsonSafe(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function formatOrderForTracking(order) {
  const delivery = parseJsonSafe(order.delivery_json);
  return {
    id: order.id,
    code: `ORD-${order.id}`,
    status: order.status || "Processing",
    tracking: (order.tracking || "").trim(),
    customer: order.customer?.name || delivery.contactName || (order.user_id ? `User #${order.user_id}` : "Guest"),
    shipping: delivery.shippingMethod || "Standard",
    createdAt: order.created_at?.slice(0, 10) || "-",
  };
}

function getThailandPostLink(trackingNumber) {
  return `https://track.thailandpost.co.th/?trackNumber=${encodeURIComponent(trackingNumber)}`;
}

export default function Tracking() {
  const currentUser = getCurrentUser();
  const isAdmin = currentUser?.role === "admin";
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [orders, setOrders] = useState([]);
  const [manualTrackingNumber, setManualTrackingNumber] = useState("");
  const [manualTrackingLink, setManualTrackingLink] = useState("");

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        setError("");
        const endpoint = isAdmin ? `${API_BASE}/orders` : `${API_BASE}/orders/me`;
        const res = await fetch(endpoint, { headers: { ...getAuthHeaders() } });
        const data = await res.json();
        if (!data.ok) {
          setError(data.message || "Failed to load tracking data");
          setOrders([]);
          return;
        }
        setOrders((data.data || []).map(formatOrderForTracking));
      } catch {
        setError("Failed to load tracking data");
        setOrders([]);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [currentUser, isAdmin]);

  const filteredOrders = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return orders;
    return orders.filter(
      (o) =>
        o.code.toLowerCase().includes(needle) ||
        o.customer.toLowerCase().includes(needle) ||
        o.status.toLowerCase().includes(needle) ||
        o.tracking.toLowerCase().includes(needle)
    );
  }, [orders, search]);

  function createManualTrackingLink() {
    const value = manualTrackingNumber.trim();
    if (!value) {
      setManualTrackingLink("");
      return;
    }
    setManualTrackingLink(getThailandPostLink(value));
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-sm">
          <div className="p-6 text-white" style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">BeBrandBy</div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand">Tracking</h1>
                <p className="text-sm text-white/90 mt-2">
                  {!currentUser
                    ? "Guest view: track parcel by tracking number."
                    : isAdmin
                    ? "Admin view: track all customer orders."
                    : "Member view: track your orders."}
                </p>
              </div>
              <div className="bg-white/15 px-4 py-2 rounded-lg text-sm">
                {!currentUser ? "Role: Guest" : isAdmin ? "Role: Admin" : "Role: Member"}
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 bg-white space-y-4">
            {error && <div className="text-sm text-rose-600">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">Orders</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{orders.length}</div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">With Tracking Number</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {orders.filter((o) => o.tracking).length}
                </div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">Pending Tracking</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">
                  {orders.filter((o) => !o.tracking).length}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-rose-100 p-4">
              <h2 className="text-lg font-semibold mb-3">Track by Number</h2>
              <div className="flex flex-col md:flex-row gap-2">
                <input
                  type="text"
                  value={manualTrackingNumber}
                  onChange={(e) => setManualTrackingNumber(e.target.value)}
                  placeholder="Enter tracking number"
                  className="flex-1 border border-rose-200 rounded-lg px-3 py-2"
                />
                <button
                  onClick={createManualTrackingLink}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  Track
                </button>
              </div>
              {manualTrackingLink && (
                <a
                  href={manualTrackingLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-rose-600 hover:underline break-all"
                >
                  {manualTrackingLink}
                </a>
              )}
            </div>

            <div className="rounded-xl border border-rose-100 p-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
                <h2 className="text-lg font-semibold">{isAdmin ? "All Orders Tracking" : "My Orders Tracking"}</h2>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={isAdmin ? "Search order / customer / tracking" : "Search order / tracking"}
                  className="w-full md:w-80 border border-rose-200 rounded-lg px-3 py-2 text-sm"
                  disabled={!currentUser}
                />
              </div>

              {!currentUser ? (
                <div className="text-sm text-gray-500">
                  Sign in to view your order list and assigned tracking numbers.
                </div>
              ) : loading ? (
                <div className="text-sm text-gray-500">Loading tracking data...</div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-sm text-gray-500">No orders found.</div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="border border-rose-100 rounded-xl p-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <div className="font-semibold text-gray-900">{order.code}</div>
                          <div className="text-sm text-gray-500">
                            {isAdmin ? `${order.customer} | ` : ""}
                            {order.createdAt} | {order.shipping}
                          </div>
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700 w-fit">
                          {order.status}
                        </span>
                      </div>

                      <div className="mt-3 text-sm">
                        {order.tracking ? (
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <span className="text-gray-700">Tracking: {order.tracking}</span>
                            <a
                              href={getThailandPostLink(order.tracking)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-rose-600 hover:underline"
                            >
                              Open carrier page
                            </a>
                          </div>
                        ) : (
                          <span className="text-gray-500">Tracking number pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
