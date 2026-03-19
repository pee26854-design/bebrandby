const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../db");

const router = express.Router();

async function findLoginUser(usernameOrEmail) {
  const [userRows] = await pool.query(
    "SELECT id, name, username, email, phone, password_hash, role FROM users WHERE username = ? OR email = ? LIMIT 1",
    [usernameOrEmail, usernameOrEmail]
  );
  if (userRows.length) return userRows[0];

  return null;
}

router.post("/register", async (req, res) => {
  try {
    const { name, username, email, phone, password } = req.body || {};
    if (!name || !username || !email || !password) {
      return res.status(400).json({ ok: false, message: "Missing required fields" });
    }

    const [existingUsers] = await pool.query(
      "SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1",
      [username, email]
    );
    if (existingUsers.length) {
      return res.status(409).json({ ok: false, message: "Username or email already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, username, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
      [name, username, email, phone || null, hashed]
    );

    const user = { id: result.insertId, name, username, email, phone: phone || null, role: "member" };
    const token = jwt.sign(user, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
    return res.json({ ok: true, user, token });
  } catch (err) {
    console.error("Register failed:", err);
    return res.status(500).json({ ok: false, message: "Register failed" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body || {};
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ ok: false, message: "Missing credentials" });
    }

    const userRow = await findLoginUser(usernameOrEmail);
    if (!userRow) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, userRow.password_hash);
    if (!ok) return res.status(401).json({ ok: false, message: "Invalid credentials" });

    const user = {
      id: userRow.id,
      name: userRow.name,
      username: userRow.username,
      email: userRow.email,
      phone: userRow.phone,
      role: userRow.role,
    };
    const token = jwt.sign(user, process.env.JWT_SECRET || "dev_secret", { expiresIn: "7d" });
    return res.json({ ok: true, user, token });
  } catch (err) {
    console.error("Login failed:", err);
    return res.status(500).json({ ok: false, message: "Login failed" });
  }
});

module.exports = router;
