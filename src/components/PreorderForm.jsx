import React, { useState } from "react";

export default function PreorderForm({ product, onClose }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      productId: product?.id,
      productName: product?.name,
      name,
      phone,
      quantity: qty,
      note,
      timestamp: new Date().toISOString(),
    };
    console.log("Preorder payload:", payload);
    setSent(true);
    // TODO: เรียก API ที่ backend เพื่อบันทึกการจองจริง
  }

  // Defensive render: จับ error ในการ render เพื่อหลีกเลี่ยงหน้าจอว่าง
  try {
    if (!product) {
      return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <p className="text-sm text-gray-700 mb-4">ไม่พบข้อมูลสินค้า</p>
            <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded">ปิด</button>
          </div>
        </div>
      );
    }

    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">จอง: {product.name}</h3>
            <button onClick={onClose} className="text-gray-500">ปิด</button>
          </div>

          {sent ? (
            <div>
              <p className="mb-4">ขอบคุณการจองของคุณ เราจะติดต่อกลับทางอีเมล</p>
              <button onClick={onClose} className="bg-indigo-600 text-white px-4 py-2 rounded">ปิด</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm">ชื่อ-นามสกุล</label>
                <input required value={name} onChange={(e)=>setName(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm">เบอร์โทร</label>
                <input
                  required
                  type="tel"
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(e)=>setPhone(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-sm">จำนวน</label>
                <input required type="number" min="1" value={qty} onChange={(e)=>setQty(Number(e.target.value))} className="w-24 border rounded px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm">หมายเหตุ (ถ้ามี)</label>
                <textarea value={note} onChange={(e)=>setNote(e.target.value)} className="w-full border rounded px-3 py-2" />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={onClose} className="px-4 py-2 border rounded">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">ส่งการจอง</button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  } catch (err) {
    console.error("PreorderForm render error:", err);
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-6 max-w-sm w-full">
          <p className="text-sm text-red-600 mb-4">เกิดข้อผิดพลาด ขณะเปิดฟอร์มการจอง</p>
          <button onClick={onClose} className="px-4 py-2 bg-indigo-600 text-white rounded">ปิด</button>
        </div>
      </div>
    );
  }
}
