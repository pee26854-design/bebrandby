import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
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

export default function ProductDetail() {
  const { id } = useParams();
  const pid = Number(id);
  const product = productsData.find((p) => p.id === pid);

  const images = useMemo(() => {
    if (!product) return [];
    if (product.images && product.images.length) return product.images;
    if (product.image) return [product.image];
    return [];
  }, [product]);

  const [mainImage, setMainImage] = useState(images[0] || "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-5xl mx-auto">
          <p>Product not found</p>
          <Link to="/shop" className="text-pink-600">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  function addToCart() {
    const cart = loadCart();
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      existing.qty += qty;
    } else {
      cart.push({ id: Date.now(), productId: product.id, qty });
    }
    saveCart(cart);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  const reviews = product.reviews || [];
  const specs = product.specs || [];
  const colors = product.colors || [];
  const similar = product.similar || [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="border rounded p-4">
              <img src={normalizeImage(mainImage)} alt={product.name} className="w-full h-64 object-contain" />
            </div>
            {images.length > 0 && (
              <div className="mt-3 flex gap-3">
                {images.map((src) => (
                  <button key={src} onClick={() => setMainImage(src)} className="w-20 h-20 border rounded overflow-hidden">
                    <img src={normalizeImage(src)} alt="" className="object-contain w-full h-full" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold">{product.name}</h1>
                <div className="text-sm text-gray-500">{product.brand}</div>
                <div className="mt-3 text-2xl text-orange-500 font-bold">฿{product.price}</div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-4">
              <div className="flex items-center gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < Math.round(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}>
                    ★
                  </span>
                ))}
              </div>
              <div className="text-sm text-gray-500">({reviews.length} reviews)</div>
            </div>

            <p className="mt-4 text-gray-700">{product.desc}</p>

            <div className="mt-6 flex items-center gap-3">
              {colors.length > 0 && (
                <>
                  <label className="text-sm">Color:</label>
                  <div className="flex gap-2">
                    {colors.map((c) => (
                      <button key={c} style={{ background: c }} className="w-6 h-6 rounded-full border" />
                    ))}
                  </div>
                </>
              )}

              <div className="ml-6">
                <label className="text-sm block">Quantity</label>
                <div className="flex items-center gap-2 mt-1">
                  <button onClick={() => setQty((s) => Math.max(1, s - 1))} className="px-2 py-1 border rounded">
                    -
                  </button>
                  <input
                    value={qty}
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value || 1)))}
                    className="w-16 text-center border rounded px-2 py-1"
                  />
                  <button onClick={() => setQty((s) => s + 1)} className="px-2 py-1 border rounded">
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button onClick={addToCart} className="px-4 py-2 bg-pink-600 text-white rounded">
                {added ? "Added to cart" : "Add to cart"}
              </button>
              <Link to="/cart" className="px-4 py-2 border rounded">
                Go to cart
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Technical Details</h3>
          {specs.length === 0 && <div className="text-sm text-gray-500">No technical details</div>}
          {specs.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {specs.map((s) => (
                <div key={s.key} className="flex justify-between bg-gray-100 p-3 rounded">
                  <div className="text-sm text-gray-600">{s.key}</div>
                  <div className="text-sm">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6">
          <h3 className="font-semibold mb-3">Customer Reviews</h3>
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-sm text-yellow-400">{Array.from({ length: r.rating }).map(() => "★")}</div>
                </div>
                <div className="text-sm text-gray-600 mt-2">{r.text}</div>
              </div>
            ))}
            {reviews.length === 0 && <div className="text-gray-500">No reviews yet</div>}
          </div>
        </div>

        {similar.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-3">Similar Products</h3>
            <div className="flex gap-4 overflow-x-auto">
              {similar.map((sid) => {
                const s = productsData.find((x) => x.id === sid);
                if (!s) return null;
                return (
                  <div key={s.id} className="w-40 p-3 bg-gray-50 rounded border">
                    <Link to={`/product/${s.id}`}>
                      <div className="h-24 mb-2 flex items-center justify-center">
                        <img src={normalizeImage(s.image)} alt={s.name} className="object-contain w-full h-full" />
                      </div>
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-gray-500">฿{s.price}</div>
                    </Link>
                    <button className="mt-2 w-full text-sm px-2 py-1 border rounded">Add to cart</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
