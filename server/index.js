import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://bebrandby.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());
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
