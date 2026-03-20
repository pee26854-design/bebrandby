import React, { useState } from "react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([
    {
      id: "USR001",
      name: "John Doe",
      email: "john.doe@example.com",
      password: "password123",
      role: "User",
    },
    {
      id: "USR002",
      name: "Jane Smith",
      email: "jane.smith@example.com",
      password: "adminpass456",
      role: "Admin",
    },
  ]);

  const [orders, setOrders] = useState([
    {
      id: "ORD001",
      customer: "John Doe",
      status: "Pending",
      total: 1500,
    },
    {
      id: "ORD002",
      customer: "Jane Smith",
      status: "Shipped",
      total: 2500,
    },
  ]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-semibold mb-4">Admin Dashboard</h1>

        {/* User Management */}
        <section className="mb-6">
          <h2 className="text-xl font-medium mb-3">จัดการผู้ใช้</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">User ID</th>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Email</th>
                <th className="border border-gray-300 px-4 py-2">Password</th>
                <th className="border border-gray-300 px-4 py-2">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="border border-gray-300 px-4 py-2">{user.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.password}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Order Management */}
        <section>
          <h2 className="text-xl font-medium mb-3">จัดการคำสั่งซื้อ</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Order ID</th>
                <th className="border border-gray-300 px-4 py-2">Customer</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                  <td className="border border-gray-300 px-4 py-2">{order.customer}</td>
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