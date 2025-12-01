const express = require("express");
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors()); // allows React to call this server


const booksRouter = require("./routes/books");
app.use("PATH HERE", booksRouter);

const loansRouter = require("./routes/loans");
app.use("PATH HERE", loansRouter);

const membersRouter = require("./routes/members");
app.use("PATH HERE", membersRouter);