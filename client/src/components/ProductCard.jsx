import React from "react";

export default function ProductCard({ product, onPreorder }) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col">
      <div className="h-40 bg-gray-100 rounded mb-4 flex items-center justify-center text-gray-400">
        รูปสินค้า
      </div>
      <h2 className="text-lg font-medium">{product.name}</h2>
      <p className="text-sm text-gray-500">{product.desc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-xl font-semibold">฿{product.price}</span>
        <button
          onClick={onPreorder}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          จองสินค้าล่วงหน้า
        </button>
      </div>
    </div>
  );
}
