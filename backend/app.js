import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth_routes.js";
import cookieParser from "cookie-parser";
import {database} from "./config/database.js"

dotenv.config();

const app = express();

app.use(cors({
    origin: ["http://localhost:5173","*"],
     credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());


// -------- Routes --------
app.use("/api/auth", authRoutes);
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

