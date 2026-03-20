import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PreorderForm from "../components/PreorderForm";
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

export default function Shop() {
  const products = productsData || [];

  const [selected, setSelected] = useState(null);
  const [addedId, setAddedId] = useState(null);

  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("popular"); // popular | price-asc | price-desc | name
  const [typeFilter, setTypeFilter] = useState([]);
  const [filterOpen, setFilterOpen] = useState({ category: true, review: false, type: false });

  const categories = Array.from(new Set(products.map((p) => p.category))).sort();

  function toggleType(t) {
    setTypeFilter((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  }

  function addToCart(product) {
    const cart = loadCart();
    const existing = cart.find((c) => c.productId === product.id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id: Date.now(), productId: product.id, qty: 1 });
    }
    saveCart(cart);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  }

  // Image modal state
  const [imageModal, setImageModal] = useState({ open: false, images: [], index: 0 });
  function openImageModal(images, idx = 0) {
    setImageModal({ open: true, images: images || [], index: idx });
  }
  function closeImageModal() {
    setImageModal({ open: false, images: [], index: 0 });
  }
  function prevImage() {
    setImageModal((s) => ({ ...s, index: (s.index - 1 + s.images.length) % s.images.length }));
  }
  function nextImage() {
    setImageModal((s) => ({ ...s, index: (s.index + 1) % s.images.length }));
  }

  const filtered = useMemo(() => {
    let out = products.filter((p) => {
      if (typeFilter.length) return typeFilter.includes(p.category);
      return true;
    });
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.desc.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
    }
    if (sortBy === "price-asc") out = out.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") out = out.sort((a, b) => b.price - a.price);
    if (sortBy === "name") out = out.sort((a, b) => a.name.localeCompare(b.name));
    return out;
  }, [products, query, typeFilter, sortBy]);

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4 w-full md:w-2/3">
            <div className="bg-white rounded-lg flex items-center w-full border p-2">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="w-full px-4 py-2 outline-none"
              />
              <button className="text-pink-600 px-3">Search</button>
            </div>
            <div className="text-sm text-gray-600">Search Result ({filtered.length})</div>
          </div>

          <div className="flex items-center gap-3 justify-end w-full md:w-auto">
            <label className="text-sm text-gray-600">Sort</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2 bg-white">
              <option value="popular">Popular</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <aside className="lg:col-span-3 bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Filters</h3>
              <button
                className="text-sm text-gray-500"
                onClick={() => {
                  setTypeFilter([]);
                  setQuery("");
                  setSortBy("popular");
                }}
              >
                Reset
              </button>
            </div>

            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setFilterOpen((s) => ({ ...s, category: !s.category }))}
              >
                <div className="font-medium">Category</div>
                <div className="text-sm text-gray-500">{filterOpen.category ? "-" : "+"}</div>
              </div>
              {filterOpen.category && (
                <div className="mt-2">
                  {categories.map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm py-1">
                      <input type="checkbox" checked={typeFilter.includes(t)} onChange={() => toggleType(t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setFilterOpen((s) => ({ ...s, review: !s.review }))}
              >
                <div className="font-medium">Customer review</div>
                <div className="text-sm text-gray-500">{filterOpen.review ? "-" : "+"}</div>
              </div>
              {filterOpen.review && (
                <div className="mt-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 py-1">
                    <input type="radio" name="rating" /> 5 stars
                  </label>
                  <label className="flex items-center gap-2 py-1">
                    <input type="radio" name="rating" /> 4 stars & up
                  </label>
                  <label className="flex items-center gap-2 py-1">
                    <input type="radio" name="rating" /> 3 stars & up
                  </label>
                </div>
              )}
            </div>

            <div className="mb-4">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setFilterOpen((s) => ({ ...s, type: !s.type }))}
              >
                <div className="font-medium">Type</div>
                <div className="text-sm text-gray-500">{filterOpen.type ? "-" : "+"}</div>
              </div>
              {filterOpen.type && (
                <div className="mt-2 text-sm text-gray-600">
                  <label className="flex items-center gap-2 py-1">
                    <input type="checkbox" /> Limited
                  </label>
                  <label className="flex items-center gap-2 py-1">
                    <input type="checkbox" /> New Arrival
                  </label>
                </div>
              )}
            </div>
          </aside>

          <main className="lg:col-span-9">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((p) => (
                <div key={p.id} className="bg-white rounded-lg border overflow-hidden relative group">
                  <div
                    className="h-56 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer"
                    onClick={() => openImageModal(p.images || [p.image], 0)}
                  >
                    {p.image || (p.images && p.images.length) ? (
                      <img
                        src={normalizeImage((p.images && p.images[0]) || p.image)}
                        alt={p.name}
                        className="object-contain w-full h-full"
                      />
                    ) : (
                      <div className="text-gray-400">No image</div>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="text-xs text-gray-500">{p.brand}</div>
                    <h3 className="text-sm font-medium mb-1 line-clamp-2">
                      <Link to={`/product/${p.id}`} className="hover:underline">
                        {p.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-gray-400 mb-3">{p.desc}</p>

                    <div className="flex items-center justify-between">
                      <div className="text-lg font-semibold text-orange-500">฿{p.price}</div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelected({ name: p.name, price: p.price, image: p.image })}
                          className="px-3 py-2 border border-pink-300 text-pink-600 rounded hover:bg-pink-50 text-xs"
                        >
                          Preorder
                        </button>
                        <button
                          onClick={() => addToCart(p)}
                          className="px-3 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 text-xs"
                        >
                          {addedId === p.id ? "Added" : "Add to cart"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full bg-white p-6 rounded border text-gray-500">No products found</div>
              )}
            </div>
          </main>
        </div>
      </div>

      {selected && <PreorderForm product={selected} onClose={() => setSelected(null)} />}

      {imageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeImageModal} className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2">
              Close
            </button>
            <div className="flex items-center justify-center">
              <button onClick={prevImage} className="text-white text-2xl px-4">
                Prev
              </button>
              <img
                src={normalizeImage(imageModal.images[imageModal.index])}
                alt="preview"
                className="max-h-[80vh] object-contain mx-4"
              />
              <button onClick={nextImage} className="text-white text-2xl px-4">
                Next
              </button>
            </div>
            <div className="text-center text-white text-sm mt-2">
              {imageModal.index + 1} / {imageModal.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
