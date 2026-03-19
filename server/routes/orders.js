const express = require("express");
const pool = require("../db");
const { authRequired, optionalAuth, adminRequired } = require("../middleware/auth");

const router = express.Router();

function parseJsonSafe(value) {
  if (!value) return {};
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

router.post("/", optionalAuth, async (req, res) => {
  try {
    const { items, delivery, payment } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: "No items" });
    }

    const productIds = items.map((i) => i.productId);
    const [products] = await pool.query(
      `SELECT id, price, name FROM products WHERE id IN (${productIds.map(() => "?").join(",")})`,
      productIds
    );

    const foundIds = new Set(products.map((p) => p.id));
    const missingIds = productIds.filter((id) => !foundIds.has(id));
    if (missingIds.length) {
      return res.status(400).json({ ok: false, message: `Invalid products: ${missingIds.join(", ")}` });
    }

    const priceMap = new Map(products.map((p) => [p.id, p.price]));
    let total = 0;
    const orderItems = items.map((i) => {
      const price = priceMap.get(i.productId) || 0;
      const qty = i.qty || 1;
      total += price * qty;
      return { productId: i.productId, qty, price };
    });

    const status = payment?.method === "deposit" ? "Deposit Paid" : "Processing";

    const userId = req.user && req.user.role === "member" ? req.user.id : null;
    const [orderResult] = await pool.query(
      "INSERT INTO orders (user_id, total, status, delivery_json, payment_json) VALUES (?, ?, ?, ?, ?)",
      [userId, total, status, JSON.stringify(delivery || {}), JSON.stringify(payment || {})]
    );

    const orderId = orderResult.insertId;
    const values = orderItems.map((it) => [orderId, it.productId, it.qty, it.price]);
    await pool.query("INSERT INTO order_items (order_id, product_id, qty, price) VALUES ?", [values]);

    return res.json({ ok: true, orderId, total, status });
  } catch (err) {
    console.error("Create order failed:", err);
    return res.status(500).json({ ok: false, message: "Failed to create order" });
  }
});

router.get("/me", authRequired, async (req, res) => {
  if (req.user.role !== "member") {
    return res.status(403).json({ ok: false, message: "Members only" });
  }

  try {
    const [orders] = await pool.query("SELECT * FROM orders WHERE user_id = ? ORDER BY id DESC", [req.user.id]);
    if (!orders.length) return res.json({ ok: true, data: [] });

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.qty, oi.price, p.name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (${orderIds.map(() => "?").join(",")})`,
      orderIds
    );

    const grouped = new Map();
    items.forEach((it) => {
      const list = grouped.get(it.order_id) || [];
      list.push({ productId: it.product_id, name: it.name, qty: it.qty, price: it.price });
      grouped.set(it.order_id, list);
    });

    const data = orders.map((o) => ({
      ...o,
      items: grouped.get(o.id) || [],
    }));
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to fetch orders" });
  }
});

router.get("/", authRequired, adminRequired, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS user_name, u.email AS user_email
       FROM orders o
       LEFT JOIN users u ON u.id = o.user_id
       ORDER BY o.id DESC`
    );
    if (!orders.length) return res.json({ ok: true, data: [] });

    const orderIds = orders.map((o) => o.id);
    const [items] = await pool.query(
      `SELECT oi.order_id, oi.product_id, oi.qty, oi.price, p.name
       FROM order_items oi
       JOIN products p ON p.id = oi.product_id
       WHERE oi.order_id IN (${orderIds.map(() => "?").join(",")})`,
      orderIds
    );

    const grouped = new Map();
    items.forEach((it) => {
      const list = grouped.get(it.order_id) || [];
      list.push({ productId: it.product_id, name: it.name, qty: it.qty, price: it.price });
      grouped.set(it.order_id, list);
    });

    const data = orders.map((o) => {
      const delivery = parseJsonSafe(o.delivery_json);
      const payment = parseJsonSafe(o.payment_json);
      const transfer = payment.transferInfo || {};

      const customerName = o.user_name || delivery.contactName || transfer.payerName || "Guest";

      return {
        ...o,
        items: grouped.get(o.id) || [],
        customer: {
          type: o.user_id ? "member" : "guest",
          name: customerName,
          email: o.user_email || "",
          phone: delivery.contactPhone || "",
        },
      };
    });
    return res.json({ ok: true, data });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to fetch orders" });
  }
});

// Update order items (admin)
router.put("/:id/items", authRequired, adminRequired, async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { items } = req.body || {};
    if (!orderId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ ok: false, message: "Invalid payload" });
    }

    const productIds = items.map((i) => i.productId);
    const [products] = await pool.query(
      `SELECT id FROM products WHERE id IN (${productIds.map(() => "?").join(",")})`,
      productIds
    );
    const foundIds = new Set(products.map((p) => p.id));
    const missing = productIds.filter((id) => !foundIds.has(id));
    if (missing.length) {
      return res.status(400).json({ ok: false, message: `Invalid products: ${missing.join(", ")}` });
    }

    // Update each item price/qty, and optionally product name (global)
    for (const it of items) {
      await pool.query(
        "UPDATE order_items SET qty = ?, price = ? WHERE order_id = ? AND product_id = ?",
        [Number(it.qty || 0), Number(it.price || 0), orderId, it.productId]
      );

      if (typeof it.name === "string" && it.name.trim()) {
        await pool.query("UPDATE products SET name = ? WHERE id = ?", [it.name.trim(), it.productId]);
      }
    }

    // Recalculate order total
    const [sumRows] = await pool.query("SELECT SUM(qty * price) AS total FROM order_items WHERE order_id = ?", [
      orderId,
    ]);
    const total = Number(sumRows[0]?.total || 0);
    await pool.query("UPDATE orders SET total = ? WHERE id = ?", [total, orderId]);

    return res.json({ ok: true, total });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to update order items" });
  }
});

module.exports = router;
