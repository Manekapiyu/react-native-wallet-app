import express from "express";
import dotenv from "dotenv";
import { initDB } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js";
import job from "./config/cron.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Start cron job only in production
if (process.env.NODE_ENV === "production") {
  job.start();
}

// Middleware
app.use(rateLimiter);
app.use(express.json());

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Transactions routes
app.use("/api/transactions", transactionsRoute);

// Catch-all for unknown routes (always JSON)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (always JSON)
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// Initialize DB and start server
initDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT} (env: ${process.env.NODE_ENV})`);
    });
  })
  .catch((err) => {
    console.error(" Failed to initialize database:", err);
    process.exit(1);
  });
