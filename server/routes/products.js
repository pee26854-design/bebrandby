import express from "express";
import { authRequired, adminRequired } from "../middleware/auth.js";
import pool from "../db.js"; // ✅ เพิ่มตรงนี้

const router = express.Router();

// GET all products
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products ORDER BY id DESC");
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to fetch products" });
  }
});

// GET product by id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE id = ? LIMIT 1",
      [req.params.id]
    );

    if (!rows.length) {
      return res.status(404).json({ ok: false, message: "Product not found" });
    }

    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to fetch product" });
  }
});

// CREATE product (admin only)
router.post("/", authRequired, adminRequired, async (req, res) => {
  try {
    const { name, price, description, image_url, category, brand } = req.body || {};

    if (!name || price === undefined) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const [result] = await pool.query(
      "INSERT INTO products (name, price, description, image_url, category, brand) VALUES (?, ?, ?, ?, ?, ?)",
      [name, price, description || null, image_url || null, category || null, brand || null]
    );

    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to create product" });
  }
});

// UPDATE product
router.put("/:id", authRequired, adminRequired, async (req, res) => {
  try {
    const { name, price, description, image_url, category, brand } = req.body || {};

    await pool.query(
      "UPDATE products SET name = ?, price = ?, description = ?, image_url = ?, category = ?, brand = ? WHERE id = ?",
      [name, price, description || null, image_url || null, category || null, brand || null, req.params.id]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to update product" });
  }
});

// DELETE product
router.delete("/:id", authRequired, adminRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ ok: false, message: "Failed to delete product" });
  }
});

// ✅ สำคัญมาก (ESM)
export default router;