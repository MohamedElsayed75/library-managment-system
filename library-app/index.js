// index.js
const express = require("express");
const { connect } = require("./db");

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Library server running");
});

// Example: GET all books
app.get("/books", async (req, res) => {
    try {
        const conn = await connect();
        const [rows] = await conn.query("SELECT * FROM books");
        res.json(rows);
    } catch (err) {
        console.log(err);
        res.status(500).send("DB error");
    }
});

app.listen(3000, () => {
    console.log("Server running on port 3000");
});
