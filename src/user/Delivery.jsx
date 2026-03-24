import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import productsData from "../data/products";
import { getAuthHeaders, getCurrentUser } from "../utils/auth";

const CART_KEY = "bbb_cart";
const DELIVERY_KEY = "bbb_delivery";

function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

const API_URL = "https://bebrandby-backend.onrender.com/api";

export default function Delivery() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [addresses, setAddresses] = useState([]);
  const [selectedAddr, setSelectedAddr] = useState(0);
  const [shippingMethod, setShippingMethod] = useState("standard");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [manualLabel, setManualLabel] = useState("");
  const [manualAddress, setManualAddress] = useState("");
  const [loading, setLoading] = useState(true);

  const cartItems = loadCart();
  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, it) => {
      const product = productsData.find((p) => p.id === it.productId);
      return sum + (product?.price || 0) * (it.qty || 1);
    }, 0);
  }, [cartItems]);

  useEffect(() => {
    async function loadAddresses() {
      if (!currentUser) {
        setLoading(false);
        return;
      }
      const res = await fetch(`${API_URL}/users/me/addresses`, { headers: { ...getAuthHeaders() } });
      const data = await res.json();
      if (data.ok) {
        const mapped = (data.data || []).map((a) => ({
          id: a.id,
          label: a.label,
          text: a.address_text,
          is_default: !!a.is_default,
        }));
        setAddresses(mapped);
        const def = mapped.find((a) => a.is_default);
        setSelectedAddr(def ? def.id : mapped[0]?.id || 0);
      }
      setLoading(false);
    }
    loadAddresses();
  }, [currentUser]);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-3xl mx-auto bg-white rounded-lg p-6 border text-center">
          <h1 className="text-xl font-semibold mb-2">Delivery</h1>
          <p className="text-gray-600 mb-4">Your cart is empty. Please add items before checkout.</p>
          <Link to="/shop" className="px-4 py-2 bg-pink-600 text-white rounded">
            Go to Shop
          </Link>
        </div>
      </div>
    );
  }

  function handleProceed(e) {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      alert("Please enter name and phone for delivery");
      return;
    }

    const selected = addresses.find((a) => a.id === selectedAddr);
    if (!selected && !manualAddress.trim()) {
      alert("Please enter delivery address");
      return;
    }

    const deliveryPayload = {
      address: selected || {
        label: manualLabel.trim() || "Address",
        text: manualAddress.trim(),
      },
      shippingMethod,
      contactName,
      contactPhone,
      totalPrice: cartTotal,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(DELIVERY_KEY, JSON.stringify(deliveryPayload));
    navigate("/payment", { state: { delivery: deliveryPayload } });
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 border">
        <div className="flex items-center justify-between mb-4">
          <Link to="/cart" className="text-sm text-pink-600">
            Back to Basket
          </Link>
          <h1 className="text-xl font-semibold">Delivery</h1>
        </div>

        {!currentUser && (
          <div className="text-sm text-red-600 mb-3">You can checkout as guest. Login to use saved addresses.</div>
        )}

        {loading ? (
          <div className="text-sm text-gray-500">Loading addresses...</div>
        ) : (
          <form onSubmit={handleProceed} className="space-y-4">
          <section>
            <h3 className="font-medium mb-2">Select address</h3>
            <div className="space-y-2">
              {addresses.map((a) => (
                <label key={a.id} className={`block p-3 border rounded ${selectedAddr === a.id ? "ring-2 ring-pink-200" : ""}`}>
                  <input type="radio" name="addr" checked={selectedAddr === a.id} onChange={() => setSelectedAddr(a.id)} className="mr-2" />
                  <span className="font-medium">{a.label}</span>
                  <div className="text-sm text-gray-600 mt-1">{a.text}</div>
                </label>
              ))}
            </div>
          </section>

          {addresses.length === 0 && (
            <section>
              <h3 className="font-medium mb-2">Delivery address</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Address label (optional)</label>
                  <input value={manualLabel} onChange={(e) => setManualLabel(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm mb-1">Full address</label>
                  <textarea value={manualAddress} onChange={(e) => setManualAddress(e.target.value)} className="w-full border rounded px-3 py-2 min-h-[90px]" />
                </div>
              </div>
            </section>
          )}

          <section>
            <h3 className="font-medium mb-2">Shipping method</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="ship" value="standard" checked={shippingMethod === "standard"} onChange={() => setShippingMethod("standard")} /> Standard (Free, 3-5 days)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="ship" value="express" checked={shippingMethod === "express"} onChange={() => setShippingMethod("express")} /> Express (฿120, 1-2 days)
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="ship" value="store" checked={shippingMethod === "store"} onChange={() => setShippingMethod("store")} /> Store pickup (Free)
              </label>
            </div>
          </section>

          <section>
            <h3 className="font-medium mb-2">Receiver info</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm mb-1">Full name</label>
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm mb-1">Phone</label>
                <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">Order total: ฿{cartTotal.toFixed(2)}</div>
            <div className="flex gap-3">
              <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded">
                Proceed to Payment
              </button>
            </div>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
