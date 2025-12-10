import express from "express";
import dotenv from "dotenv";
import { sql } from "./config/db.js";

dotenv.config();

const app = express();

//middlaware
// app.use(express.json());
// app.use((req,res,next)=>{
//     console.log("Hey we hit a req, the method is ", req.method, "and the url is ", req.url);
//     next();
// });

const PORT = process.env.PORT || 5001;

async function initDB() {
    try{
        await sql`CREATE TABLE IF NOT EXISTS transactions(
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        create_at DATE NOT NULL DEFAULT CURRENT_DATE
    )`;

    console.log("Database initializing Successful");

    }catch (error){
        console.error("Error initializing database:", error);
        process.exit(1);

    }
}

app.get("/", (req, res) => {
    res.send("It's working");
});

app.post("/api/transactions", async (req, res) => {
    //title ,amount, category, user_id
    try{
        const { title, amount, category, user_id } = req.body;

        if(!title || !user_id || !category || amount === undefined){
            return res.status(400).json({ error: "Missing required fields" });
        }

        const transaction = await sql`
            INSERT INTO transactions (title, amount, category, user_id)
            VALUES (${title}, ${amount}, ${category}, ${user_id})
            RETURNING *
        `;

        console.log(transaction);
        res.status(201).json({ message: "Transaction created successfully", transaction: transaction[0] });


    }catch (error){
        console.error("Error creating transaction:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Initialize DB and start server
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});