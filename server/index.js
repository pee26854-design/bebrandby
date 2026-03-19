const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const emailRoutes = require("./routes/email");

const app = express();
const PORT = process.env.PORT || 5000;
const ORIGIN = process.env.FRONTEND_ORIGIN || "*";

function parseAllowedOrigins(originValue) {
  if (!originValue || originValue === "*") return true;
  return originValue
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

const allowedOrigins = parseAllowedOrigins(ORIGIN);

app.use(
  cors({
    origin(origin, callback) {
      if (allowedOrigins === true || !origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
  res.json({ ok: true, message: "BeBrandBy API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api", emailRoutes);

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});
