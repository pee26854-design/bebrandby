import React, { useState, useRef } from "react";
import PreorderForm from "../components/PreorderForm";
import productsData from "../data/products"; // ใช้ข้อมูลร่วมกัน
import { FaInstagram, FaTiktok, FaLine } from "react-icons/fa6"; // ✅ เพิ่ม import ไอคอน
import { Link } from "react-router-dom";

const mockCarouselProducts = {
  "Chanel Blue.png": { name: "Chanel Bleu De Chanel EDP", price: 5490 },
  "Rose Goldea.png": { name: "Bvlgari Rose Goldea EDT", price: 4890 },
  "Burberry Weekend.png": { name: "Burberry Weekend", price: 3590 },
  "Divine Moon.png": { name: "Divine Moon Perfume", price: 2990 },
  "Electric Sky.png": { name: "Electric Sky Eau De Parfum", price: 3290 },
  "Myslf Eau De Parfum 1.png": { name: "YSL MYSLF Eau De Parfum", price: 5190 },
  "Omnia Ameyhyste.png": { name: "Bvlgari Omnia Amethyste", price: 4690 },
  "Y Eau de Parfum.png": { name: "Y Eau De Parfum", price: 4990 },
};


export default function Home() {
  const products = productsData;
  const [selected, setSelected] = useState(null);

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
  

  // รายชื่อไฟล์ภาพใน public/images (วางไฟล์จริงที่ public/images/)
  const publicImages = [
    "Chanel Blue.png",
    "Rose Goldea.png",
    "Burberry Weekend.png",
    "Divine Moon.png",
    "Electric Sky.png",
    "Myslf Eau De Parfum 1.png",
    "Omnia Ameyhyste.png",
    "Y Eau de Parfum.png",
  ];

  const carouselRef = useRef(null);

  function scrollPrev() {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: -carouselRef.current.clientWidth / 1.5, behavior: "smooth" });
  }
  function scrollNext() {
    if (!carouselRef.current) return;
    carouselRef.current.scrollBy({ left: carouselRef.current.clientWidth / 1.5, behavior: "smooth" });
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Carousel / hero gradient */}
      <section
        style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}
        className="py-6 relative"
      >
        {/* ปุ่มลูกศรระดับ section (ใหญ่ขึ้นและมี z-index สูง) */}
        <button
          onClick={scrollPrev}
          aria-label="previous"
          className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-3 shadow z-30"
          style={{ background: "rgba(255,255,255,0.95)" }}
        >
          ‹
        </button>

        <div className="max-w-5xl mx-auto">
          <div className="mx-10 overflow-hidden rounded-lg">
            <div
              ref={carouselRef}
              className="h-40 flex items-center gap-6 px-4 overflow-x-hidden "
            >
              {/* แสดงรูปจาก public/images */}
              {publicImages.map((file, idx) => {
                const product =productsData.find((p) => p.image === file || p.images?.includes(file)) || mockCarouselProducts[file];
                return (
                  <div key={file} className="flex-shrink-0 w-48 h-40 rounded overflow-hidden flex items-center justify-center relative group cursor-pointer" onClick={() => openImageModal(product?.images || [file], 0)}>
                    <img src={`/images/${file}`} alt={file} className="object-contain w-full h-full" />
                {product && (
                <div
                className="absolute bottom-0 left-0 right-0 p-2 text-white text-xs transition
                bg-gradient-to-r from-pink-500/90 to-rose-600/90 group-hover:from-pink-600 group-hover:to-rose-700">
                <div className="font-medium truncate">
                  {product.name}
                </div>
                <div className="font-bold text-white">
                  ฿{product.price?.toLocaleString()}
                </div>
              </div>
              )}
              </div>
              );
              })}

              {/* ถ้ายังไม่มีรูป -- แสดง placeholder */}
              {publicImages.length === 0 && (
                <div className="w-full h-32 flex items-center justify-center text-white/90">
                  ไม่มีรูปใน carousel — วางไฟล์ที่ public/images เพื่อแสดง
                </div>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={scrollNext}
          aria-label="next"
          className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-3 shadow z-30"
          style={{ background: "rgba(255,255,255,0.95)" }}
        >
          ›
        </button>
      </section>

      <main className="flex-1 max-w-5xl mx-auto w-full p-6 space-y-6">
        {/* Best Sellers Collection */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Best Sellers Collection</h2>
            <a href="#" className="text-pink-600 font-semibold text-sm hover:text-pink-700">ดูทั้งหมด →</a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Dior Lip", price: 1600, image: "dior lip.png" },
              { name: "WHOOP", price: 6590, image: "WHOOP.png" },
              { name: "Dragon Tee", price: 2490, image: "Dragon Tee.png" },
              { name: "Polo Outlet", price: 1990, image: "Polo outlet.png" },
            ].map((p, idx) => (
              <div key={idx} className="bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition border border-gray-100">
                <div className="h-32 rounded-lg mb-3 flex items-center justify-center bg-gray-50 overflow-hidden cursor-pointer" onClick={() => openImageModal([p.image], 0)}>
                  <img src={`/images/${p.image}`} alt={p.name} className="object-contain w-full h-full" />
                </div>
                <h3 className="font-semibold text-sm text-gray-700 truncate">{p.name}</h3>
                <p className="text-pink-600 font-bold text-lg mt-2">฿{p.price}</p>
                <button onClick={() => setSelected({ name: p.name, price: p.price, image: p.image })} className="w-full mt-2 bg-pink-600 text-white text-xs py-2 rounded-lg hover:bg-pink-700 transition">
                  จองเลย
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Flash Sale / Limited Time Offer */}
        <section className="rounded-xl p-8 text-white text-center" style={{ background: 'linear-gradient(135deg, #EA3E5B 0%, #C41E3A 100%)' }}>
          <div className="inline-block bg-white/20 px-4 py-1 rounded-full text-sm font-semibold mb-3 backdrop-blur">⚡ FLASH SALE</div>
          <h3 className="text-3xl font-black mb-2">สินค้าพิเศษลดสูงสุด 50%</h3>
          <p className="text-white/90 mb-4 text-sm">เหลือเวลาจำกัด — เพิ่มรับสินค้าใหม่มาจากอเมริกา</p>
          <button className="bg-white text-pink-600 font-bold px-8 py-3 rounded-lg hover:bg-pink-50 transition shadow-lg">ช้อปตอนนี้</button>
        </section>

        {/* Two Column Category Spotlight */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category 1: Wellness */}
          <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition" style={{ background: 'linear-gradient(135deg, #FAC09F 0%, #FDDBAA 100%)' }}>
            <div className="p-8 text-white flex flex-col justify-between h-48">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">✨ หมวดแนะนำ</div>
                <h3 className="text-2xl font-black mb-2">วิตามิน & สุขภาพ</h3>
                <p className="text-sm text-white/90">เลือกสรรจากสินค้าดี ชี้วยดูแลตัวเองได้ดี</p>
              </div>
              <button className="bg-white text-pink-600 font-bold px-6 py-2 rounded-lg w-fit hover:bg-pink-50 transition text-sm">ดูหมวดนี้</button>
            </div>
          </div>

          {/* Category 2: Fashion & Lifestyle */}
          <div className="rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition" style={{ background: 'linear-gradient(135deg, #FFB8C6 0%, #FD9CB5 100%)' }}>
            <div className="p-8 text-white flex flex-col justify-between h-48">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-white/80 mb-2">👗 หมวดแนะนำ</div>
                <h3 className="text-2xl font-black mb-2">เสื้อผ้า & อุปกรณ์</h3>
                <p className="text-sm text-white/90">แฟชั่น แต่งตัว และไลฟ์สไตล์จากแบรนด์ดี</p>
              </div>
              <button className="bg-white text-pink-600 font-bold px-6 py-2 rounded-lg w-fit hover:bg-pink-50 transition text-sm">ดูหมวดนี้</button>
            </div>
          </div>
        </div>

        {/* Full width promotional block (styled to match site colors) */}
        <div className="rounded-lg p-6 text-white" style={{ background: 'linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)', minHeight: '220px' }}>
          <div className="max-w-6xl mx-auto h-full">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
              {/* Clothing card */}
              <div className="bg-white/15 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between hover:bg-white/20 transition">
                <div>
                  <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">เสื้อผ้า</div>
                  <div className="font-bold text-white text-xl mt-2 leading-snug">ใส่สบายทุกวัน — สไตล์ที่เป็นคุณ</div>
                  <div className="text-sm text-white/85 mt-3 leading-relaxed">ผ้านุ่ม ระบายอากาศดี ตัดเย็บเนี้ยบ เหมาะทั้งงานและวันชิล</div>
                </div>
                <button className="bg-white text-pink-600 font-semibold px-4 py-2 rounded-lg text-sm mt-4 hover:bg-pink-50 transition shadow-md">ช้อปเลย</button>
              </div>

              {/* Water bottle card */}
              <div className="bg-white/15 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between hover:bg-white/20 transition">
                <div>
                  <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">กระติกน้ำ</div>
                  <div className="font-bold text-white text-xl mt-2 leading-snug">พกสะดวก เก็บความเย็น-ร้อนได้ดี</div>
                  <div className="text-sm text-white/85 mt-3 leading-relaxed">ปลอดสาร BPA ฝาปิดแน่น ไม่รั่ว เหมาะกับทุกกิจกรรม</div>
                </div>
                <button className="bg-white text-pink-600 font-semibold px-4 py-2 rounded-lg text-sm mt-4 hover:bg-pink-50 transition shadow-md">สั่งเลย</button>
              </div>

              {/* Vitamin card */}
              <div className="bg-white/15 p-6 rounded-xl backdrop-blur-sm flex flex-col justify-between hover:bg-white/20 transition">
                <div>
                  <div className="text-xs font-semibold text-white/80 uppercase tracking-wide">วิตามิน</div>
                  <div className="font-bold text-white text-xl mt-2 leading-snug">เติมพลัง ดูแลตัวเองทุกวัน</div>
                  <div className="text-sm text-white/85 mt-3 leading-relaxed">สูตรมาตรฐาน ผ่านการตรวจ เลือกได้ตามไลฟ์สไตล์</div>
                </div>
                <button className="bg-white text-pink-600 font-semibold px-4 py-2 rounded-lg text-sm mt-4 hover:bg-pink-50 transition shadow-md">สั่งแบบรายเดือน</button>
              </div>
            </div>
          </div>
        </div>

        {/* Feature badges row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">🚚</div>
            <div className="text-xs">
              <div className="font-medium">Free Shipping</div>
              <div className="text-gray-500">On orders over ฿1,000</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">💬</div>
            <div className="text-xs">
              <div className="font-medium">24/7 Support</div>
              <div className="text-gray-500">ช่วยเหลือทุกเวลา</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">🔒</div>
            <div className="text-xs">
              <div className="font-medium">Secure Payment</div>
              <div className="text-gray-500">ปลอดภัย</div>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-lg p-3 border">
            <div className="w-10 h-10 bg-pink-50 rounded-full flex items-center justify-center text-pink-600">💯</div>
            <div className="text-xs">
              <div className="font-medium">Money Guarantee</div>
              <div className="text-gray-500">คืนเงินได้</div>
            </div>
          </div>
        </div>

        {/* Why Pre-order with BeBrandBy */}
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4">ทำไมต้อง Pre-order กับ BeBrandBy? 🤍</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">✨ ได้ของแท้ 100%</div>
              <p className="text-sm text-gray-600">ซื้อโดย "คนในครอบครัว" ที่อเมริกา ไม่ผ่านตัวกลาง ไม่สุ่มเสี่ยง ได้ของจริงแบบมั่นใจสุดๆ</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">💰 ราคาแฟร์ ไม่บวกเว่อร์</div>
              <p className="text-sm text-gray-600">คิดราคาแบบเป็นธรรม เพราะตั้งใจให้ลูกค้าเข้าถึงแบรนด์อเมริกาดีๆ ไม่ปั่นราคา</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">⚡ อัปเดตของเร็ว ตอบไว</div>
              <p className="text-sm text-gray-600">เราดูแลเองทั้งทีม แชตไว ใส่ใจ รายงานสถานะให้ตลอด ลูกค้าไม่ต้องลุ้น</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">🔍 ดูสินค้าหน้างานจริง</div>
              <p className="text-sm text-gray-600">น้องสาวเดินเช็กโปรหน้า Sephora, Target, TJ Maxx, Outlet ฯลฯ ได้ราคาดี ของหายากเสมอ</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">📦 แพ็กดี ส่งปลอดภัย</div>
              <p className="text-sm text-gray-600">แพ็กอย่างดีจากอเมริกา ดูแลการจัดส่งในไทยอย่างระมัดระวัง ไม่ยับ ไม่บุบ</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm">
              <div className="text-lg font-semibold mb-2">❤️ ร้านเล็กๆ ทำด้วยใจ</div>
              <p className="text-sm text-gray-600">BeBrandBy ไม่ใช่ร้านใหญ่ที่ไร้ตัวตน ทุกออเดอร์สำคัญมากสำหรับเรา ได้ความดูแลพิเศษ</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-pink-100 shadow-sm col-span-1 md:col-span-2 lg:col-span-3">
              <div className="text-lg font-semibold mb-2">🎁 อยากได้อะไรเป็นพิเศษ สั่งได้เลย</div>
              <p className="text-sm text-gray-600">ส่งรูป/ลิงก์ให้หา เราก็จัดให้ได้หมด เหมือนมีเพื่อนอยู่ที่อเมริกาคอยหิ้วของให้ตลอดเวลา 💛</p>
            </div>
          </div>
        </section>
      </main>
      {/* Image Modal */}
      {imageModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={closeImageModal}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <button onClick={closeImageModal} className="absolute top-2 right-2 text-white bg-black/40 rounded-full p-2">✕</button>
            <div className="flex items-center justify-center">
              <button onClick={prevImage} className="text-white text-2xl px-4">‹</button>
              <img src={`/images/${imageModal.images[imageModal.index]}`} alt="preview" className="max-h-[80vh] object-contain mx-4" />
              <button onClick={nextImage} className="text-white text-2xl px-4">›</button>
            </div>
            <div className="text-center text-white text-sm mt-2">{imageModal.index + 1} / {imageModal.images.length}</div>
          </div>
        </div>
      )}

      {/* Footer ตามภาพ */}
      <footer style={{ background: "#6a1620" }} className="text-white mt-6">
        <div className="max-w-6xl mx-auto px-6 py-6">
          {/* top row: logo left, menu right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* ถ้ามีไฟล์โลโก้ให้วางใน public/images และแก้ src */}
              <img
                src="/images/logo-white.png"
                alt="BeBrandBy"
                className="h-8 w-auto"
                onError={(e) => { e.target.style.display = "none"; }}
              />
              <div className="text-white font-semibold">BeBrandBy</div>
            </div>

            <nav className="hidden md:flex gap-8 text-sm">
            <Link to="/" className="hover:underline">
              Home
            </Link>
            <Link to="/about" className="hover:underline">
              About Us
            </Link>
            <Link to="/shop" className="hover:underline">
              Shop
            </Link>
            <Link to="/contact" className="hover:underline">
              Contact Us
            </Link>
          </nav>

          </div>

          {/* divider */}
          <div className="border-t border-white/20 my-6" />

          {/* bottom row: social icons left, policy text right */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-white/90">
              {/* instagram */}
              <a
                href="https://www.instagram.com/bebrandby_?igsh=MXZ4Zjh4enR1M3ViZw%3D%3D&utm_source=qr"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FaInstagram className="w-5 h-5" />
              </a>

              {/* Tiktok */}
              <a
                href="https://www.tiktok.com/@bebrandby"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FaTiktok className="w-5 h-5" />
              </a>

              {/* Line Open Chat */}
              <a
                href="https://line.me/ti/g2/c4MLscIs5r3-cpmwAIMgAlhe2WOhy4n71wAxVA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
              >
                <FaLine className="w-5 h-5" />
              </a>

              {/* Line official */}
              <a
                href="https://lin.ee/B0eSFti"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-white/10 hover:bg:white/20 transition"
              >
                <FaLine className="w-5 h-5" />
              </a>
            </div>

            <div className="text-sm text-white/90 text-right">
              <div>Privacy Policy · Term of Use · All Rights Reserved · 2025</div>
            </div>
          </div>
        </div>
      </footer>

      {selected && <PreorderForm product={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
