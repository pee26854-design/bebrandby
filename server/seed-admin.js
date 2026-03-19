require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function seedAdmin() {
  const admin = {
    name: process.env.ADMIN_NAME || "Admin",
    username: process.env.ADMIN_USERNAME || "admin",
    email: process.env.ADMIN_EMAIL || "admin@bebrandby.local",
    phone: process.env.ADMIN_PHONE || null,
    password: process.env.ADMIN_PASSWORD || "admin1234",
  };

  if (!process.env.ADMIN_PASSWORD) {
    console.error("ADMIN_PASSWORD is required. Set it in server/.env before running.");
    process.exit(1);
  }

  try {
    const hashed = await bcrypt.hash(admin.password, 10);

    const [rows] = await pool.query(
      "SELECT id FROM admins WHERE username = ? OR email = ? LIMIT 1",
      [admin.username, admin.email]
    );

    if (rows.length) {
      await pool.query(
        "UPDATE admins SET name = ?, username = ?, email = ?, phone = ?, password_hash = ? WHERE id = ?",
        [admin.name, admin.username, admin.email, admin.phone, hashed, rows[0].id]
      );
      console.log("Updated existing admin account.");
    } else {
      await pool.query(
        "INSERT INTO admins (name, username, email, phone, password_hash) VALUES (?, ?, ?, ?, ?)",
        [admin.name, admin.username, admin.email, admin.phone, hashed]
      );
      console.log("Created new admin account.");
    }
  } catch (err) {
    console.error("Seed admin failed:", err.message || err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seedAdmin();
