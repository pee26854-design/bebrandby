import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import emailRoutes from "./routes/email.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ กำหนด CORS ครั้งเดียว (สำคัญมาก)
const allowedOrigins = [
  "http://localhost:5173",
  "https://bebrandby.vercel.app"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// ✅ middleware
app.use(express.json({ limit: "1mb" }));

// ✅ test route
app.get("/", (req, res) => {
  res.json({ ok: true, message: "BeBrandBy API is running" });
});

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", emailRoutes);

// ✅ start server (มีแค่ครั้งเดียว!)
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});