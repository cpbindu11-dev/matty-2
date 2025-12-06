import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import designRoutes from "./routes/designRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import draftRoutes from "./routes/draftRoutes.js";  // 👈 NEW: Import draft routes

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/designs", designRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/drafts", draftRoutes);  // 👈 NEW: Add draft routes

// Health Check
app.get("/", (req, res) => {
  res.json({ message: "Matty API is running 🎨" });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: "Something went wrong!", 
    error: process.env.NODE_ENV === "development" ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));