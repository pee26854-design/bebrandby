import React, { useState } from "react";
import { FaInstagram, FaTiktok, FaLine } from "react-icons/fa6";

export default function Contact() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  function validate() {
    const e = {};
    if (!name.trim()) e.name = "กรุณากรอกชื่อ-นามสกุล";
    if (!phone.trim()) e.phone = "กรุณากรอกเบอร์โทร";
    if (!message.trim()) e.message = "กรุณากรอกข้อความ";
    return e;
  }

  function handleSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    const payload = { name, phone, email, message, timestamp: new Date().toISOString() };
    console.log("Contact payload:", payload);
    setSent(true);
    // TODO: เรียก API ส่งข้อความจริงที่ backend
    // clear form (ถ้าต้องการ)
    setName("");
    setPhone("");
    setEmail("");
    setMessage("");
  }

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info */}
        <aside className="lg:col-span-1 bg-white rounded-lg p-6 border shadow-md">
          <h2 className="text-xl font-semibold mb-1 text-pink-700">ติดต่อเรา</h2>
          <p className="text-sm text-gray-600 mb-6">สอบถามข้อมูลสินค้า / การสั่งซื้อ / การชำระเงิน</p>

          <div className="text-sm space-y-3">
            <div>
              <div className="font-medium">ที่อยู่</div>
              <div className="text-gray-600">123/4 ถนนสุขุมวิท กรุงเทพฯ 10110</div>
            </div>

            <div>
              <div className="font-medium">เบอร์โทร</div>
              <div><a href="tel:0812345678" className="text-pink-600 font-medium">081-234-5678</a></div>
            </div>

            <div>
              <div className="font-medium">อีเมล</div>
              <div><a href="mailto:support@bebrandby.example" className="text-pink-600 font-medium">support@bebrandby.example</a></div>
            </div>

            <div className="pt-4 border-t">
              <div className="font-medium mb-3">ติดตามเรา</div>
              <div className="flex items-center gap-3">
                <a href="https://www.instagram.com/bebrandby_?igsh=MXZ4Zjh4enR1M3ViZw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition" title="Instagram">
                  <FaInstagram className="w-5 h-5" />
                </a>
                <a href="https://www.tiktok.com/@bebrandby" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition" title="TikTok">
                  <FaTiktok className="w-5 h-5" />
                </a>
                <a href="https://lin.ee/B0eSFti" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-pink-50 text-pink-600 hover:bg-pink-100 transition" title="Line">
                  <FaLine className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </aside>

        {/* Contact form */}
        <main className="lg:col-span-2 bg-white rounded-lg p-8 border shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-pink-700">ส่งข้อความถึงเรา</h1>
            <div className="text-sm text-gray-500">ตอบกลับภายใน 24-48 ชั่วโมง</div>
          </div>

          {sent && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded">
              ขอบคุณข้อความของคุณ เราจะติดต่อกลับโดยเร็วที่สุด
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">ชื่อ-นามสกุล</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 ${errors.name ? "border-red-400" : "border-gray-300"}`}
                />
                {errors.name && <div className="text-xs text-red-500 mt-1">{errors.name}</div>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">เบอร์โทร</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300 ${errors.phone ? "border-red-400" : "border-gray-300"}`}
                  type="tel"
                  placeholder="เช่น 0859564653"
                />
                {errors.phone && <div className="text-xs text-red-500 mt-1">{errors.phone}</div>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">อีเมล (ถ้ามี)</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                type="email"
                placeholder="you@gmail.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">ข้อความ</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`w-full border rounded px-3 py-2 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-pink-300 ${errors.message ? "border-red-400" : "border-gray-300"}`}
              />
              {errors.message && <div className="text-xs text-red-500 mt-1">{errors.message}</div>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
              <button type="button" onClick={() => { setName(""); setPhone(""); setEmail(""); setMessage(""); setErrors({}); }} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition">
                ล้างข้อมูล
              </button>
              <button type="submit" className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700 transition shadow-sm">
                ส่งข้อความ
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

