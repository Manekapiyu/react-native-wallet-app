import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";
import rateLimiter from "./middleware/rateLimiter.js";

import transactionsRoute from "./routes/transactionsRoute.js"


dotenv.config();

const app = express();

// Middleware to parse JSON body
app.use(rateLimiter);
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Initialize DB
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        create_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}



app.use("/api/transactions", transactionsRoute);

// Start server after DB init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
