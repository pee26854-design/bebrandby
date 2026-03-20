import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import productsData from "../data/products";

const CART_KEY = "bbb_cart";

function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

function normalizeImage(src) {
  if (!src) return "";
  return src.startsWith("/") ? src : `/images/${src}`;
}

export default function Cart() {
  const [items, setItems] = useState(() => loadCart());
  const [promo, setPromo] = useState("");
  const [usePromo, setUsePromo] = useState(false);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  function updateQty(id, qty) {
    setItems((s) => s.map((it) => (it.id === id ? { ...it, qty: Math.max(1, qty) } : it)));
  }
  function removeItem(id) {
    setItems((s) => s.filter((it) => it.id !== id));
  }

  const cartDetails = useMemo(() => {
    return items.map((it) => {
      const product = productsData.find((p) => p.id === it.productId) || {};
      return {
        ...it,
        product,
        lineTotal: (product.price || 0) * (it.qty || 1),
      };
    });
  }, [items]);

  const subtotal = cartDetails.reduce((s, i) => s + i.lineTotal, 0);
  const shipping = subtotal > 0 ? 0 : 0;
  const discount = usePromo && promo.trim().toUpperCase() === "SAVE10" ? subtotal * 0.1 : 0;
  const total = subtotal + shipping - discount;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FAC09F] to-[#EA3E5B] text-white flex items-center justify-center font-semibold">
                1
              </div>
              <div className="font-semibold text-pink-700">My basket</div>
            </div>
            <div className="flex-1 border-b border-pink-100" />
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">2</div>
              <div>Delivery</div>
            </div>
            <div className="flex-1 border-b border-pink-100" />
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">3</div>
              <div>Payment</div>
            </div>
          </div>
        </div>

        {items.length === 0 && (
          <div className="bg-white rounded border p-6 text-center text-gray-600">
            Your cart is empty.
            <div className="mt-3">
              <Link to="/shop" className="px-4 py-2 bg-pink-600 text-white rounded">
                Go to Shop
              </Link>
            </div>
          </div>
        )}

        {items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <div className="flex items-center justify-between mb-3">
                <Link to="/shop" className="text-sm text-pink-600">
                  Back
                </Link>
                <h2 className="text-xl font-semibold">
                  My Basket <span className="text-sm text-gray-500">({items.length} items)</span>
                </h2>
              </div>

              <div className="space-y-4">
                {cartDetails.map((c) => (
                  <div key={c.id} className="bg-white rounded border p-4 shadow-sm hover:shadow-md transition">
                    <div className="flex gap-4">
                      <div className="w-28 h-28 bg-gray-50 flex items-center justify-center overflow-hidden rounded-lg border border-gray-100">
                        {c.product.image ? (
                          <img src={normalizeImage(c.product.image)} alt={c.product.name} className="object-contain w-full h-full" />
                        ) : (
                          <div className="text-gray-400">No image</div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium">{c.product.name}</div>
                            <div className="text-sm text-gray-500 mt-1">{c.product.brand}</div>
                          </div>
                          <button onClick={() => removeItem(c.id)} className="text-pink-600 hover:bg-pink-50 rounded px-2 py-1">
                            Remove
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-4">
                          <div className="flex items-center gap-2 border border-gray-200 rounded-md overflow-hidden">
                            <button onClick={() => updateQty(c.id, c.qty - 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">
                              -
                            </button>
                            <input value={c.qty} onChange={(e) => updateQty(c.id, Number(e.target.value || 1))} className="w-12 text-center px-2 py-1 outline-none" />
                            <button onClick={() => updateQty(c.id, c.qty + 1)} className="px-3 py-1 text-gray-600 hover:bg-gray-100">
                              +
                            </button>
                          </div>

                          <div className="text-pink-600 font-semibold">฿{(c.product.price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="bg-white rounded-lg border p-4 shadow-sm">
                <h3 className="font-semibold mb-3 text-lg">Summary</h3>
                <div className="text-sm text-gray-600 mb-3">{items.length} items</div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <div>Subtotal:</div>
                    <div>฿{subtotal.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div>Shipping:</div>
                    <div>{shipping === 0 ? "Free" : `฿${shipping.toFixed(2)}`}</div>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <div>Discount:</div>
                      <div>-฿{discount.toFixed(2)}</div>
                    </div>
                  )}
                </div>

                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-500">Total:</div>
                    <div className="text-xl font-bold text-pink-600">฿{total.toFixed(2)}</div>
                  </div>

                  <Link to="/delivery" className="mt-4 block text-center w-full text-white px-4 py-2 rounded" style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}>
                    Continue to Delivery
                  </Link>
                </div>

                <div className="mt-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={usePromo} onChange={(e) => setUsePromo(e.target.checked)} /> I would like to use a promotional code.
                  </label>
                  {usePromo && (
                    <div className="mt-2 flex gap-2">
                      <input value={promo} onChange={(e) => setPromo(e.target.value)} placeholder="Promo code" className="w-full border rounded px-3 py-2" />
                      <button onClick={() => {}} className="px-3 py-2 bg-gradient-to-r from-[#FAC09F] to-[#EA3E5B] text-white rounded">
                        Apply
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        <div className="h-8" />
      </div>
    </div>
  );
}
