const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.js");
//database import 
const { createTransaction, hasOverdueTransactions } = require("../database/database.js");

router.post("/borrow", async (req, res) => {
    try {
        const book_id  = req.body.book_id;
        const member_id = req.body.member_id;

        if (!book_id) {
            return res.status(400).json({ message: "book_id is required" });
        }

        const hasOverdue = await hasOverdueTransactions(member_id);
        if (hasOverdue) {
            return res.status(400).json({ message: "Cannot borrow books while you have overdue transaction(s)." });
        }

        const result = await createTransaction(member_id, book_id);

        if (result.error) {
            return res.status(400).json({ message: result.error });
        }

        return res.json({message: "Book borrowed successfully"});
    } catch (error) {
        console.error("Borrow route error:", error);
        return res.status(500).json({ message: "Server error while borrowing the book" });
    }
});
module.exports = router;