import React from "react";
import { Link } from "react-router-dom";
import { FaInstagram, FaTiktok, FaLine } from "react-icons/fa6";

export default function About() {
	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-5xl mx-auto p-6">
				{/* Hero / Our Story */}
				<section className="bg-white rounded-lg p-8 mb-6 shadow">
					<h1 className="text-3xl font-semibold mb-4">❤️ BeBrandBy </h1>
					
					<div className="space-y-4 text-gray-700 leading-relaxed">
						<p>
							<strong>BeBrandBy</strong> เริ่มต้นจากความชอบเล็กๆ ของพวกเรา 3 คน<br/>
							ที่มักจะสั่งของจากอเมริกามาใช้เองอยู่เสมอ เพราะมีหลายแบรนด์ที่ชอบมาก แต่เสียดาย…ที่ในไทยไม่มีขาย! 😔
						</p>
						
						<p>
							ยิ่งสั่งบ่อย ก็ยิ่งรู้สึกว่า "ของดีๆ จากอเมริกา น่าจะมีคนอยากได้เหมือนเรา" 💭<br/>
							และยิ่งไปกว่านั้น เรามีน้องสาวที่อยู่ที่อเมริกาอยู่แล้ว เลยกลายเป็นจุดเริ่มต้นเล็กๆ ที่อบอุ่นของร้านนี้ ❤️
						</p>
						
						<p className="font-medium">
							เราเลยคุยกันว่า<br/>
							<span className="italic">"งั้นเปิดร้านพรีออเดอร์เลยไหม ให้ของแท้ ส่งตรงมาจากอเมริกา โดยคนในครอบครัวเราเอง"</span>
						</p>
						
						<p>
							น้องสาวที่อเมริกาจะเป็นคนคอยไปซื้อ เช็กสต๊อก เดินร้าน หาโปร และจัดส่งกลับไทยให้เราดูแลต่อ<br/>
							<strong>ทุกชิ้นผ่านมือคนในทีมจริงๆ ไม่มีตัวกลาง ไม่มีสุ่มเสี่ยง ได้ของแท้ 100%</strong> ✨
						</p>
						
						<p className="bg-pink-50 p-4 rounded-lg border-l-4 border-pink-300">
							ร้านนี้เลยเกิดขึ้นจาก<br/>
							<strong>ความชอบ → ความตั้งใจ → และความใส่ใจของพวกเราจริงๆ</strong><br/>
							เพื่อให้ทุกคนได้ของอเมริกาแท้ๆ แบบอุ่นใจ เหมือนเพื่อนหิ้วของฝากให้ ❤️✨
						</p>
					</div>

					<div className="mt-6">
						<Link to="/shop" className="inline-block bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700">ไปช้อปเลย</Link>
					</div>
				</section>

				{/* Values / Why us */}
				<section className="bg-white rounded-lg p-6 mb-6 shadow">
					<h2 className="text-2xl font-semibold mb-3">Why choose us</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="p-4 border rounded">
							<div className="text-xl font-medium mb-1">Authentic</div>
							<div className="text-sm text-gray-600">รับประกันสินค้ามีแหล่งที่มา และคุณภาพ</div>
						</div>
						<div className="p-4 border rounded">
							<div className="text-xl font-medium mb-1">Fast Support</div>
							<div className="text-sm text-gray-600">ตอบคำถามและช่วยเหลือเรื่องการสั่งซื้อ</div>
						</div>
						<div className="p-4 border rounded">
							<div className="text-xl font-medium mb-1">Secure Payment</div>
							<div className="text-sm text-gray-600">ระบบชำระเงินปลอดภัยและหลากหลาย</div>
						</div>
					</div>
				</section>

				{/* Why Pre-order with BeBrandBy */}
				<section className="bg-white rounded-lg p-6 mb-6 shadow">
					<h2 className="text-2xl font-semibold mb-4">ทำไมต้อง Pre-order กับ BeBrandBy? ❤️</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">✨ ได้ของแท้ 100%</div>
							<p className="text-sm text-gray-600">ซื้อโดย "คนในครอบครัว" ที่อเมริกา ไม่ผ่านตัวกลาง ไม่สุ่มเสี่ยง ได้ของจริงแบบมั่นใจสุดๆ</p>
						</div>

						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">💰 ราคาแฟร์ ไม่บวกเว่อร์</div>
							<p className="text-sm text-gray-600">คิดราคาแบบเป็นธรรม เพราะตั้งใจให้ลูกค้าเข้าถึงแบรนด์อเมริกาดีๆ ไม่ปั่นราคา</p>
						</div>

						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">⚡ อัปเดตของเร็ว ตอบไว</div>
							<p className="text-sm text-gray-600">เราดูแลเองทั้งทีม แชตไว ใส่ใจ รายงานสถานะให้ตลอด ลูกค้าไม่ต้องลุ้น</p>
						</div>

						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">🔍 ดูสินค้าหน้างานจริง</div>
							<p className="text-sm text-gray-600">น้องสาวเดินเช็กโปรหน้า Sephora, Target, TJ Maxx, Outlet ฯลฯ ได้ราคาดี ของหายากเสมอ</p>
						</div>

						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">📦 แพ็กดี ส่งปลอดภัย</div>
							<p className="text-sm text-gray-600">แพ็กอย่างดีจากอเมริกา ดูแลการจัดส่งในไทยอย่างระมัดระวัง ไม่ยับ ไม่บุบ</p>
						</div>

						<div className="p-4 border rounded">
							<div className="text-lg font-semibold mb-2">❤️ ร้านเล็กๆ ทำด้วยใจ</div>
							<p className="text-sm text-gray-600">BeBrandBy ไม่ใช่ร้านใหญ่ที่ไร้ตัวตน ทุกออเดอร์สำคัญมากสำหรับเรา ได้ความดูแลพิเศษ</p>
						</div>

						<div className="p-4 border rounded md:col-span-2">
							<div className="text-lg font-semibold mb-2">🎁 อยากได้อะไรเป็นพิเศษ สั่งได้เลย</div>
							<p className="text-sm text-gray-600">ส่งรูป/ลิงก์ให้หา เราก็จัดให้ได้หมด เหมือนมีเพื่อนอยู่ที่อเมริกาคอยหิ้วของให้ตลอดเวลา ❤️</p>
						</div>
					</div>
				</section>

				{/* Contact */}
				<section className="bg-white rounded-lg p-6 shadow">
					<h2 className="text-2xl font-semibold mb-3">Contact</h2>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<div className="text-sm text-gray-600 mb-2">Customer service</div>
							<div className="text-base">Phone: <a href="tel:0812345678" className="text-pink-600">081-234-5678</a></div>
							<div className="text-base">Email: <a href="mailto:support@bebrandby.example" className="text-pink-600">bebrandby@gmail.com</a></div>
						</div>
						<div>
							<div className="text-sm text-gray-600 mb-2">Follow us</div>
							<div className="flex gap-3">
								<a href="https://www.instagram.com/bebrandby_?igsh=MXZ4Zjh4enR1M3ViZw%3D%3D&utm_source=qr" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 transition" title="Instagram">
									<FaInstagram className="w-5 h-5 text-pink-600" />
								</a>
								<a href="https://www.tiktok.com/@bebrandby" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 transition" title="TikTok">
									<FaTiktok className="w-5 h-5 text-pink-600" />
								</a>
								<a href="https://line.me/ti/g2/c4MLscIs5r3-cpmwAIMgAlhe2WOhy4n71wAxVA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default" target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 hover:bg-pink-100 transition" title="Line">
									<FaLine className="w-5 h-5 text-pink-600" />
								</a>
							</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

