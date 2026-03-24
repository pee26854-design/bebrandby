import React, { useEffect, useMemo, useState } from "react";
import { API_URL, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function Account() {
  const STORAGE_KEYS = useMemo(
    () => ({
      lastOrderId: "bbb_last_order_id",
    }),
    []
  );

  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [user, setUser] = useState({ name: "", phone: "", email: "" });
  const [editing, setEditing] = useState(false);

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(0);
  const [newAddress, setNewAddress] = useState({ label: "", text: "" });
  const [lastOrderId, setLastOrderId] = useState(() => localStorage.getItem(STORAGE_KEYS.lastOrderId) || "");
  const REQUEST_TIMEOUT_MS = 8000;

  async function fetchJsonWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      return { ok: true, status: res.status, data };
    } catch (err) {
      return { ok: false, error: err };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  useEffect(() => {
    if (!currentUser) {
      setLoading(false);
      return;
    }

    async function loadData() {
      try {
        setLoading(true);
        setError("");
        const headers = { ...getAuthHeaders() };

        const [profileRes, addressRes, ordersRes] = await Promise.allSettled([
          fetchJsonWithTimeout(`${API_URL}/users/me`, { headers }),
          fetchJsonWithTimeout(`${API_URL}/users/me/addresses`, { headers }),
          fetchJsonWithTimeout(`${API_URL}/orders/me`, { headers }),
        ]);

        const profile = profileRes.status === "fulfilled" ? profileRes.value : { ok: false };
        const addressData = addressRes.status === "fulfilled" ? addressRes.value : { ok: false };
        const ordersData = ordersRes.status === "fulfilled" ? ordersRes.value : { ok: false };

        if (!profile.ok && !addressData.ok && !ordersData.ok) {
          setError("Unable to load account data. Please check API server on localhost:5000.");
          setUser({
            name: currentUser?.name || "",
            phone: currentUser?.phone || "",
            email: currentUser?.email || "",
          });
          setOrders([]);
          setAddresses([]);
          setPrimaryAddressId(0);
          return;
        }

        if (profile.ok && profile.data?.ok) {
          setUser({
            name: profile.data.data?.name || "",
            phone: profile.data.data?.phone || "",
            email: profile.data.data?.email || "",
          });
        } else {
          setUser({
            name: currentUser?.name || "",
            phone: currentUser?.phone || "",
            email: currentUser?.email || "",
          });
        }

        if (addressData.ok && addressData.data?.ok) {
          const mapped = (addressData.data.data || []).map((a) => ({
            id: a.id,
            label: a.label,
            text: a.address_text,
            is_default: !!a.is_default,
          }));
          setAddresses(mapped);
          const defaultAddr = mapped.find((a) => a.is_default);
          setPrimaryAddressId(defaultAddr ? defaultAddr.id : mapped[0]?.id || 0);
        }

        if (ordersData.ok && ordersData.data?.ok) {
          const mappedOrders = (ordersData.data.data || []).map((o) => {
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
          if (!lastOrderId && mappedOrders[0]) {
            setLastOrderId(mappedOrders[0].id);
          }
        }
        if (!profile.ok || !addressData.ok || !ordersData.ok) {
          setError("Some account data could not be loaded.");
        }
      } catch (err) {
        setError("Failed to load account data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [STORAGE_KEYS.lastOrderId, currentUser, lastOrderId]);

  useEffect(() => {
    if (lastOrderId) {
      localStorage.setItem(STORAGE_KEYS.lastOrderId, lastOrderId);
    }
  }, [STORAGE_KEYS.lastOrderId, lastOrderId]);

  async function saveProfile() {
    try {
      const res = await fetch(`${API_URL}/users/me`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!data.ok) {
        setError("Failed to save profile");
        return;
      }
      setEditing(false);
      setError("");
    } catch {
      setError("Failed to save profile");
    }
  }

  async function addAddress() {
    if (!newAddress.label.trim() || !newAddress.text.trim()) return;
    const payload = {
      label: newAddress.label,
      address_text: newAddress.text,
      is_default: true,
    };
    const res = await fetch(`${API_URL}/users/me/addresses`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.ok) {
      setAddresses((s) => [
        { id: data.id, label: newAddress.label, text: newAddress.text, is_default: true },
        ...s.map((a) => ({ ...a, is_default: false })),
      ]);
      setPrimaryAddressId(data.id);
      setNewAddress({ label: "", text: "" });
    }
  }

  async function removeAddress(id) {
    await fetch(`${API_URL}/users/me/addresses/${id}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders() },
    });
    setAddresses((s) => s.filter((a) => a.id !== id));
    if (primaryAddressId === id) {
      const next = addresses.find((a) => a.id !== id);
      setPrimaryAddressId(next ? next.id : 0);
    }
  }

  async function setDefaultAddress(id) {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    await fetch(`${API_URL}/users/me/addresses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ label: address.label, address_text: address.text, is_default: true }),
    });
    setAddresses((s) => s.map((a) => ({ ...a, is_default: a.id === id })));
    setPrimaryAddressId(id);
  }

  function markAsLastOrder(orderId) {
    setLastOrderId(orderId);
  }

  const lastOrder = orders.find((o) => o.id === lastOrderId);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 font-brand">My Account</h1>
          <p className="text-gray-600 mb-4">Please sign in to view your account information.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          Loading account data...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-sm">
          <div
            className="p-6 text-white"
            style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">BeBrandBy</div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand">My Account</h1>
                <p className="text-white/90 text-sm mt-2">Manage your profile, orders, and shipping addresses.</p>
              </div>
              <div className="bg-white/15 px-4 py-2 rounded-lg text-sm">
                {user.name} | {user.email}
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">Total Orders</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{orders.length}</div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">Shipping Addresses</div>
                <div className="text-2xl font-bold text-gray-900 mt-2">{addresses.length}</div>
              </div>
              <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                <div className="text-xs text-gray-500">Last Order</div>
                <div className="text-lg font-semibold text-gray-900 mt-2">
                  {lastOrder ? lastOrder.id : "Not selected"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="text-sm text-rose-600">{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-1 bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 font-semibold">
                {user.name?.slice(0, 1) || "U"}
              </div>
              <div>
                <div className="text-lg font-medium">{user.name}</div>
                <div className="text-sm text-gray-500">{user.email}</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                  value={user.name}
                  onChange={(e) => setUser((u) => ({ ...u, name: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Phone</label>
                <input
                  value={user.phone}
                  onChange={(e) => setUser((u) => ({ ...u, phone: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  value={user.email}
                  onChange={(e) => setUser((u) => ({ ...u, email: e.target.value }))}
                  disabled={!editing}
                  className={`w-full mt-1 border rounded-lg px-3 py-2 ${
                    editing ? "border-rose-200" : "bg-gray-50 cursor-not-allowed"
                  }`}
                />
              </div>

              <div className="flex gap-2 justify-end">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-3 py-1 border border-rose-200 rounded-lg text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveProfile}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
                    >
                      Save
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700"
                  >
                    Edit profile
                  </button>
                )}
              </div>
            </div>
          </section>

          <section className="lg:col-span-2 space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-500">Last order</div>
                  <div className="font-semibold">
                    {lastOrder ? `${lastOrder.id} | ${lastOrder.date}` : "Not selected"}
                  </div>
                </div>
                {lastOrder && (
                  <div className="text-sm text-gray-600">Total: THB {lastOrder.total.toLocaleString()}</div>
                )}
              </div>
              <div className="text-xs text-gray-500 mt-2">
                Select any order as the last order to pin it in this summary card.
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">My Orders</h2>
                <div className="text-sm text-gray-500">{orders.length} orders</div>
              </div>

              <div className="space-y-3">
                {orders.map((o) => (
                  <div key={o.id} className="p-4 border border-rose-100 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{o.id}</div>
                        <div className="text-sm text-gray-500">
                          {o.date} | THB {o.total.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs px-2 py-1 rounded-full bg-rose-50 text-rose-700">
                        {o.status}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Items</div>
                      <ul className="text-sm text-gray-600">
                        {o.items.map((item, idx) => (
                          <li key={`${o.id}-${idx}`}>
                            {item.qty}x {item.name} | THB {Number(item.price || 0).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                      <div className="text-xs text-gray-500 mt-2">
                        Shipping: {o.shipping} | Tracking: {o.tracking}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => markAsLastOrder(o.id)}
                        className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                      >
                        Set as last order
                      </button>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <div className="text-gray-500">No orders yet.</div>}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Shipping Addresses</h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={addAddress}
                    className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-xs text-gray-500">Label</label>
                  <input
                    value={newAddress.label}
                    onChange={(e) => setNewAddress((s) => ({ ...s, label: e.target.value }))}
                    className="w-full border border-rose-200 rounded-lg px-3 py-2 mt-1"
                    placeholder="Home / Office"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-gray-500">Address</label>
                  <textarea
                    value={newAddress.text}
                    onChange={(e) => setNewAddress((s) => ({ ...s, text: e.target.value }))}
                    className="w-full border border-rose-200 rounded-lg px-3 py-2 mt-1"
                    rows={2}
                    placeholder="Full address"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {addresses.map((a) => (
                  <div key={a.id} className="p-4 border border-rose-100 rounded-xl flex items-start justify-between">
                    <div>
                      <div className="font-medium">
                        {a.label}{" "}
                        {primaryAddressId === a.id && (
                          <span className="text-xs text-emerald-600">(Default)</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">{a.text}</div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setDefaultAddress(a.id)}
                        className="text-sm px-2 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                      >
                        Set default
                      </button>
                      <button
                        onClick={() => removeAddress(a.id)}
                        className="text-sm px-2 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && <div className="text-gray-500">No addresses yet.</div>}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
