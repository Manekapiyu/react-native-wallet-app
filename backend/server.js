import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

// Middleware to parse JSON body
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
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  }
}

app.get("/", (req, res) => {
  res.send("It's working");
});

// Create transaction
app.post("/api/transactions", async (req, res) => {
  try {
    const { title, amount, category, user_id } = req.body;

    // Validate inputs
    if (!title || !user_id || !category || amount === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Insert in the correct order 👇
    const transaction = await sql`
      INSERT INTO transactions (title, amount, category, user_id)
      VALUES (${title}, ${amount}, ${category}, ${user_id})
      RETURNING *
    `;

    res.status(201).json({
      message: "Transaction created successfully",
      transaction: transaction[0]
    });

  } catch (error) {
    console.error("Error creating transaction:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/transactions/:userId",async(req,res)=>{
    
})

// Start server after DB init
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
