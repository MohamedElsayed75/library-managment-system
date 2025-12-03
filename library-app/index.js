// index.js
const express = require("express");
const { connect } = require("./db");
const cors = require('cors'); 
const signupRoutes = require("./signuplogic");
const loginRoute = require("./loginlogic");
const bookRoute = require("./booklogic");


// Connect to front-end
const corsOptions = {
    origin: ["http://localhost:3000"]
}

const app = express();
app.use(express.json());
app.use(cors(corsOptions));


app.get("/", (req, res) => {
    res.send("Library server and Cors are running.");
});

// // Example: GET all books
// app.get("/books", async (req, res) => {
//     try {
//         const conn = await connect();
//         const [rows] = await conn.query("SELECT * FROM books");
//         res.json(rows);
//     } catch (err) {
//         console.log(err);
//         res.status(500).send("DB error");
//     }
// });

app.use("/api", signupRoutes);
app.use("/api", loginRoute);
app.use("/api", bookRoute );
// Using different ports for cors to work.
app.listen(5001, () => {
    console.log("Server running on port 5001");
});

// Added signuplogic and routes to it.
// Changed route of back-end to 5001.
// Added cors
// added loginlogic and routes to it.
// Added  bookloigc which works!
// Updated booklogic with joins and also in sql.