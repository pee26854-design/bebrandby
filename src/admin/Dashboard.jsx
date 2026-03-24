import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL, getAuthHeaders, getCurrentUser } from "../utils/auth";

export default function Dashboard() {
  const currentUser = getCurrentUser();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editItems, setEditItems] = useState({});
  const [showExportMenu, setShowExportMenu] = useState(false);

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen p-6 bg-[#fff7f5]">
        <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl border border-rose-100 text-center shadow-sm">
          <h1 className="text-xl font-semibold mb-2 font-brand">Admin Dashboard</h1>
          <p className="text-gray-600 mb-4">คุณไม่มีสิทธิ์เข้าถึงหน้านี้</p>
          <Link to="/" className="px-4 py-2 bg-rose-600 text-white rounded-lg">
            กลับหน้าแรก
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const headers = { ...getAuthHeaders() };
        const [ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/orders`, { headers }),
          fetch(`${API_URL}/products`, { headers }),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        if (ordersData.ok) setOrders(ordersData.data || []);
        else setError(ordersData.message || "Failed to load orders");

        if (productsData.ok) setProducts(productsData.data || []);
        else setError(productsData.message || "Failed to load products");
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    return [
      { label: "ยอดขายรวม", value: `฿${totalRevenue.toLocaleString()}` },
      { label: "คำสั่งซื้อทั้งหมด", value: `${orders.length}` },
      { label: "จำนวนสินค้า", value: `${products.length}` },
      { label: "ออเดอร์ล่าสุด", value: orders[0] ? `#${orders[0].id}` : "-" },
    ];
  }, [orders, products]);

  const recentOrders = orders.slice(0, 5).map((o) => ({
    id: `BB-${o.id}`,
    customer: o.customer?.name || (o.user_id ? `User #${o.user_id}` : "Guest"),
    customerType: o.customer?.type || (o.user_id ? "member" : "guest"),
    items: (o.items || []).reduce((sum, it) => sum + Number(it.qty || 0), 0),
    total: `เธฟ${Number(o.total || 0).toLocaleString()}`,
    status: o.status,
  }));

  function startEditOrder(order) {
    setEditingOrderId(order.id);
    const map = {};
    (order.items || []).forEach((it) => {
      map[it.productId] = { ...it };
    });
    setEditItems(map);
  }

  function toggleEditOrder(order) {
    if (editingOrderId === order.id) {
      setEditingOrderId(null);
      setEditItems({});
      return;
    }
    startEditOrder(order);
  }

  function updateEditItem(productId, field, value) {
    setEditItems((s) => ({
      ...s,
      [productId]: { ...s[productId], [field]: value },
    }));
  }

  async function saveOrderItems(orderId) {
    try {
      const payload = {
        items: Object.values(editItems).map((it) => ({
          productId: it.productId,
          name: it.name,
          price: Number(it.price || 0),
          qty: Number(it.qty || 0),
        })),
      };
      const res = await fetch(`${API_URL}/orders/${orderId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message || "Failed to update order items");
        return;
      }
      setEditingOrderId(null);
      setEditItems({});
      setError("");

      const ordersRes = await fetch(`${API_URL}/orders`, { headers: { ...getAuthHeaders() } });
      const ordersData = await ordersRes.json();
      if (ordersData.ok) setOrders(ordersData.data || []);
    } catch (err) {
      setError("Failed to update order items");
    }
  }

  function toCsv(headers, rows) {
    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    return [headers.map(esc).join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  }

  function downloadBlob(filename, mime, content) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function exportOrdersExcel() {
    const headers = ["Order ID", "User ID", "Total", "Status", "Date", "Items"];
    const rows = orders.map((o) => [
      o.id,
      o.user_id || "Guest",
      o.total,
      o.status,
      o.created_at?.slice(0, 19) || "",
      (o.items || []).length,
    ]);
    const csv = toCsv(headers, rows);
    downloadBlob("orders.csv", "text/csv;charset=utf-8;", csv);
  }

  function exportProductsExcel() {
    const headers = ["Product ID", "Name", "Price", "Category", "Brand"];
    const rows = products.map((p) => [p.id, p.name, p.price, p.category, p.brand]);
    const csv = toCsv(headers, rows);
    downloadBlob("products.csv", "text/csv;charset=utf-8;", csv);
  }

  function exportOrdersWord() {
    const rows = orders
      .map(
        (o) =>
          `<tr>
            <td>${o.id}</td>
            <td>${o.user_id || "Guest"}</td>
            <td>${o.total}</td>
            <td>${o.status}</td>
            <td>${o.created_at?.slice(0, 19) || ""}</td>
          </tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
      <h2>Orders Report</h2>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>Order ID</th><th>User ID</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;
    downloadBlob("orders.doc", "application/msword", html);
  }

  function exportProductsWord() {
    const rows = products
      .map(
        (p) =>
          `<tr>
            <td>${p.id}</td>
            <td>${p.name}</td>
            <td>${p.price}</td>
            <td>${p.category || ""}</td>
            <td>${p.brand || ""}</td>
          </tr>`
      )
      .join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"></head><body>
      <h2>Products Report</h2>
      <table border="1" cellpadding="6" cellspacing="0">
        <thead><tr><th>ID</th><th>Name</th><th>Price</th><th>Category</th><th>Brand</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </body></html>`;
    downloadBlob("products.doc", "application/msword", html);
  }

  function handleExport(type) {
    setShowExportMenu(false);
    if (type === "orders_excel") exportOrdersExcel();
    if (type === "orders_word") exportOrdersWord();
    if (type === "products_excel") exportProductsExcel();
    if (type === "products_word") exportProductsWord();
  }

  return (
    <div className="min-h-screen bg-[#fff7f5]">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="rounded-2xl overflow-hidden border border-rose-100 bg-white shadow-sm">
          <div
            className="p-6 text-white"
            style={{ background: "linear-gradient(90deg, #FAC09F 0%, #EA3E5B 100%)" }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-widest text-white/80">BeBrandBy Admin</div>
                <h1 className="text-3xl md:text-4xl font-bold font-brand">Dashboard</h1>
                <p className="text-white/90 text-sm mt-2">ภาพรวมระบบสำหรับผู้ดูแล</p>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu((s) => !s)}
                  className="bg-white text-rose-600 font-semibold px-4 py-2 rounded-lg hover:bg-rose-50 transition"
                >
                  Export Report
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white text-gray-800 rounded-lg shadow-lg border border-rose-100 overflow-hidden z-10">
                    <button
                      onClick={() => handleExport("orders_excel")}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50"
                    >
                      Orders (Excel)
                    </button>
                    <button
                      onClick={() => handleExport("orders_word")}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50"
                    >
                      Orders (Word)
                    </button>
                    <button
                      onClick={() => handleExport("products_excel")}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50"
                    >
                      Products (Excel)
                    </button>
                    <button
                      onClick={() => handleExport("products_word")}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50"
                    >
                      Products (Word)
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="p-4 md:p-6 bg-white">
            {error && <div className="mb-4 text-sm text-rose-600">{error}</div>}
            {loading && <div className="text-sm text-gray-500">กำลังโหลดข้อมูล...</div>}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-rose-100 bg-rose-50/40 p-4 hover:shadow-sm transition"
                >
                  <div className="text-xs text-gray-500">{s.label}</div>
                  <div className="text-2xl font-bold text-gray-900 mt-2">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 rounded-2xl bg-white border border-rose-100 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">คำสั่งซื้อล่าสุด</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2">รหัสออเดอร์</th>
                    <th className="py-2">ลูกค้า</th>
                    <th className="py-2">จำนวน</th>
                    <th className="py-2">ยอดรวม</th>
                    <th className="py-2">สถานะ</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className="border-b last:border-0">
                      <td className="py-3 font-semibold text-gray-800">{o.id}</td>
                      <td className="py-3">
                        <div>{o.customer}</div>
                        <div className="text-xs text-gray-500">{o.customerType === "guest" ? "Guest" : "Member"}</div>
                      </td>
                      <td className="py-3">{o.items}</td>
                      <td className="py-3 font-semibold text-gray-900">{o.total}</td>
                      <td className="py-3">
                        <span className="px-2 py-1 rounded-full text-xs bg-rose-50 text-rose-700">
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!loading && recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-gray-500">
                        ยังไม่มีคำสั่งซื้อ
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-6 space-y-4">
              <h3 className="font-semibold text-gray-800">จัดการสินค้าในออเดอร์</h3>
              {orders.slice(0, 5).map((o) => (
                <div key={o.id} className="border border-rose-100 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Order #{o.id}</div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">Total: เธฟ{Number(o.total || 0).toLocaleString()}</div>
                      <button
                        onClick={() => toggleEditOrder(o)}
                        className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                      >
                        {editingOrderId === o.id ? "กำลังแก้ไข" : "แก้ไข"}
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-2">
                    {(o.items || []).map((it) => {
                      const edit = editItems[it.productId] || it;
                      return (
                        <div key={it.productId} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center">
                          <input
                            className="border border-rose-200 rounded-lg px-2 py-1"
                            value={edit.name || ""}
                            onChange={(e) => updateEditItem(it.productId, "name", e.target.value)}
                            disabled={editingOrderId !== o.id}
                          />
                          <input
                            className="border border-rose-200 rounded-lg px-2 py-1"
                            type="number"
                            value={edit.price}
                            onChange={(e) => updateEditItem(it.productId, "price", e.target.value)}
                            disabled={editingOrderId !== o.id}
                          />
                          <input
                            className="border border-rose-200 rounded-lg px-2 py-1"
                            type="number"
                            value={edit.qty}
                            onChange={(e) => updateEditItem(it.productId, "qty", e.target.value)}
                            disabled={editingOrderId !== o.id}
                          />
                          <div className="text-sm text-gray-500 flex items-center">Product #{it.productId}</div>
                          <button
                            onClick={() => toggleEditOrder(o)}
                            className="text-sm px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                          >
                        {editingOrderId === o.id ? "กำลังแก้ไข" : "แก้ไข"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-3 flex gap-2">
                    {editingOrderId === o.id ? (
                      <>
                        <button
                          onClick={() => saveOrderItems(o.id)}
                          className="px-3 py-1 bg-rose-600 text-white rounded-lg"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => {
                            setEditingOrderId(null);
                            setEditItems({});
                          }}
                          className="px-3 py-1 border border-rose-200 rounded-lg"
                        >
                          ยกเลิก
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEditOrder(o)}
                        className="px-3 py-1 border border-rose-200 rounded-lg hover:bg-rose-50"
                      >
                        แก้ไขสินค้าในออเดอร์
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!loading && orders.length === 0 && <div className="text-sm text-gray-500">ยังไม่มีคำสั่งซื้อ</div>}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-rose-100 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setShowExportMenu(true)}
                className="w-full text-left p-4 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition"
              >
                <div className="font-semibold text-gray-900">รายงานสรุป</div>
                <div className="text-xs text-gray-500 mt-1">ส่งออกเป็นไฟล์ Word/Excel</div>
              </button>
            </div>

            <div className="mt-6 rounded-xl p-4 text-white" style={{ background: "#6a1620" }}>
              <div className="text-xs text-white/70 uppercase tracking-wider">Alert</div>
              <div className="font-semibold mt-1">สินค้าใกล้หมดสต็อก</div>
              <div className="text-sm text-white/90 mt-2">มีรายการที่ใกล้หมดสต็อก</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

