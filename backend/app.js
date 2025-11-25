import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import addressRoutes from "./routes/address_routes.js";
import productRoutes from "./routes/product_routes.js";
import orderRoutes from "./routes/order_routes.js";
import bannerRoutes from "./routes/banner_routes.js";
import cookieParser from "cookie-parser";
import {database} from "./config/database.js"
import quoteRoutes from "./routes/quote_routes.js";
import userRoutes from "./routes/user_routes.js";
import offerRoutes from "./routes/offerRoutes.js";

dotenv.config();

const app = express();

app.use(cors({
    origin: [    "https://printmaania.com",
    "https://www.printmaania.com","http://localhost:5173"],
     credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});
app.use(cookieParser());
app.use(express.json());
app.set("trust proxy", 1); // Important if you later use cookies/sessions behind reverse proxy


// -------- Routes --------
app.use("/api/auth", authRoutes);
app.use("/api/address",addressRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/user", userRoutes);
app.use("/api/quotes", quoteRoutes);
app.use("/api/offers",offerRoutes);
app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});


// -------- Start Server --------
const PORT = process.env.PORT || 5001;
database()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} already in use! Run 'lsof -i :${PORT}' to check.`);
      } else {
        console.error(`❌ Listen error:`, err);
      }
    });
  })
  .catch((err) => {
    console.error(`❌ DB connection failed:`, err.message);
    process.exit(1);  // Exit if DB fails
  });

