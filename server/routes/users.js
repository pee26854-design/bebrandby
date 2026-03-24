import userRoutes from "./routes/user.js";
const express = require("express");
const pool = require("../db");
const { authRequired } = require("../middleware/auth");

const router = express.Router();

router.get("/me", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name, username, email, phone, role FROM users WHERE id = ? LIMIT 1",
      [req.user.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, message: "User not found" });
    return res.json({ ok: true, data: rows[0] });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to fetch profile" });
  }
});

router.put("/me", authRequired, async (req, res) => {
  try {
    const { name, phone, email } = req.body || {};

    await pool.query("UPDATE users SET name = ?, phone = ?, email = ? WHERE id = ?", [
      name || null,
      phone || null,
      email || null,
      req.user.id,
    ]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to update profile" });
  }
});

router.get("/me/addresses", authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, label, address_text, is_default FROM addresses WHERE user_id = ? ORDER BY is_default DESC, id DESC",
      [req.user.id]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to fetch addresses" });
  }
});

router.post("/me/addresses", authRequired, async (req, res) => {
  try {
    const { label, address_text, is_default } = req.body || {};
    if (!label || !address_text) {
      return res.status(400).json({ ok: false, message: "Missing fields" });
    }

    if (is_default) {
      await pool.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    }

    const [result] = await pool.query(
      "INSERT INTO addresses (user_id, label, address_text, is_default) VALUES (?, ?, ?, ?)",
      [req.user.id, label, address_text, is_default ? 1 : 0]
    );
    return res.json({ ok: true, id: result.insertId });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to add address" });
  }
});

router.put("/me/addresses/:id", authRequired, async (req, res) => {
  try {
    const { label, address_text, is_default } = req.body || {};
    if (is_default) {
      await pool.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [req.user.id]);
    }
    await pool.query(
      "UPDATE addresses SET label = ?, address_text = ?, is_default = ? WHERE id = ? AND user_id = ?",
      [label, address_text, is_default ? 1 : 0, req.params.id, req.user.id]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to update address" });
  }
});

router.delete("/me/addresses/:id", authRequired, async (req, res) => {
  try {
    await pool.query("DELETE FROM addresses WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, message: "Failed to delete address" });
  }
});

export default router;
