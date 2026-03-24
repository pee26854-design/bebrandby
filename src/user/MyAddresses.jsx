import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function MyAddresses() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentUser());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addresses, setAddresses] = useState([]);
  const [primaryAddressId, setPrimaryAddressId] = useState(0);
  const [newAddress, setNewAddress] = useState({ label: "", text: "" });

  async function loadAddresses() {
    const latestUser = getCurrentUser();
    setCurrentUser(latestUser);
    if (!latestUser) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await import(`${API_URL}/users/me/addresses`, { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to load addresses");
        setAddresses([]);
        return;
      }
      const mapped = (data.data || []).map((a) => ({
        id: a.id,
        label: a.label,
        text: a.address_text,
        is_default: !!a.is_default,
      }));
      setAddresses(mapped);
      const defaultAddr = mapped.find((a) => a.is_default);
      setPrimaryAddressId(defaultAddr ? defaultAddr.id : mapped[0]?.id || 0);
      setError("");
    } catch (err) {
      setError("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAddresses();
  }, []);

  async function addAddress() {
    if (!newAddress.label.trim() || !newAddress.text.trim()) return;
    try {
      const payload = {
        label: newAddress.label,
        address_text: newAddress.text,
        is_default: true,
      };
      const res = await import(`${API_URL}/users/me/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to add address");
        return;
      }
      setAddresses((s) => [
        { id: data.id, label: newAddress.label, text: newAddress.text, is_default: true },
        ...s.map((a) => ({ ...a, is_default: false })),
      ]);
      setPrimaryAddressId(data.id);
      setNewAddress({ label: "", text: "" });
      setError("");
    } catch {
      setError("Failed to add address");
    }
  }

  async function removeAddress(id) {
    try {
      await import(`${API_URL}/users/me/addresses/${id}`, {
        method: "DELETE",
        headers: { ...getAuthHeaders() },
      });
      setAddresses((s) => s.filter((a) => a.id !== id));
      if (primaryAddressId === id) {
        const next = addresses.find((a) => a.id !== id);
        setPrimaryAddressId(next ? next.id : 0);
      }
    } catch {
      setError("Failed to remove address");
    }
  }

  async function setDefaultAddress(id) {
    const address = addresses.find((a) => a.id === id);
    if (!address) return;
    try {
      await import(`${API_URL}/users/me/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({ label: address.label, address_text: address.text, is_default: true }),
      });
      setAddresses((s) => s.map((a) => ({ ...a, is_default: a.id === id })));
      setPrimaryAddressId(id);
    } catch {
      setError("Failed to update address");
    }
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          <h1 className="text-2xl font-semibold mb-2 font-brand">My Addresses</h1>
          <p className="text-gray-600 mb-4">กรุณาเข้าสู่ระบบเพื่อดูที่อยู่ของคุณ</p>
          <Link to="/" className="px-4 py-2 bg-rose-600 text-white rounded-lg">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fff7f5] p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-rose-100 p-6 text-center shadow-sm">
          กำลังโหลดที่อยู่...
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
                <h1 className="text-3xl md:text-4xl font-bold font-brand">My Addresses</h1>
                <p className="text-white/90 text-sm mt-2">จัดการที่อยู่จัดส่งของคุณ</p>
              </div>
              <div className="bg-white/15 px-4 py-2 rounded-lg text-sm">
                ทั้งหมด {addresses.length} รายการ
              </div>
            </div>
          </div>
          <div className="p-6 bg-white">
            {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}
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
              <div className="flex gap-2">
                <button
                  onClick={addAddress}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                >
                  + Add Address
                </button>
                <button
                  onClick={loadAddresses}
                  className="px-4 py-2 border border-rose-200 rounded-lg"
                >
                  รีเฟรช
                </button>
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
              {addresses.length === 0 && <div className="text-gray-500">ยังไม่มีที่อยู่</div>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/account" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">My Account</div>
            <div className="font-semibold mt-1">ดูภาพรวมบัญชี</div>
          </Link>
          <Link to="/personal-info" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">Personal Info</div>
            <div className="font-semibold mt-1">แก้ไขข้อมูลส่วนตัว</div>
          </Link>
          <Link to="/orders" className="bg-white border border-rose-100 rounded-2xl p-4 hover:shadow-sm">
            <div className="text-sm text-gray-500">Orders</div>
            <div className="font-semibold mt-1">ดูคำสั่งซื้อทั้งหมด</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
