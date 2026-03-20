import React, { useState } from "react";

export default function UserDashboard() {
  const [userInfo, setUserInfo] = useState({
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "0812345678",
    address: "123/4 ถนนสุขุมวิท กรุงเทพฯ 10110",
  });

  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      date: "2026-01-20",
      status: "Delivered",
      total: 1500,
    },
    {
      id: "ORD002",
      date: "2026-01-22",
      status: "Pending",
      total: 2500,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">User Dashboard</h1>

        {/* User Info */}
        <section className="mb-6">
          <h2 className="text-xl font-medium mb-3">ข้อมูลผู้ใช้</h2>
          <div className="space-y-2">
            <div><strong>ชื่อ:</strong> {userInfo.name}</div>
            <div><strong>อีเมล:</strong> {userInfo.email}</div>
            <div><strong>เบอร์โทร:</strong> {userInfo.phone}</div>
            <div><strong>ที่อยู่:</strong> {userInfo.address}</div>
          </div>
        </section>

        {/* User Orders */}
        <section>
          <h2 className="text-xl font-medium mb-3">คำสั่งซื้อของคุณ</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                <th className="border border-gray-300 px-4 py-2">Date</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.date}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.status}</td>
                  <td className="border border-gray-300 px-4 py-2">฿{order.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}