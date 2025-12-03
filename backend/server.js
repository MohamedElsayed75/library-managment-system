const express = require("express");
const cors = require("cors");
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 5000;

app.use(cors()); // allow all origins
app.use(express.json()); // parse JSON bodies

const authRouter = require("./routes/auth");
app.use("/auth", authRouter);

const dashboardRouter = require("./routes/dashboard");
app.use("/dashboard", dashboardRouter);

const booksRouter = require("./routes/books");
app.use("/books", booksRouter);

// const loansRouter = require("./routes/loans");
// app.use("/loans", loansRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});