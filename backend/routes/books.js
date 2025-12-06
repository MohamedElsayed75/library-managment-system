const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  searchBooks,
  checkAndApplyFines
} = require("../database/database.js");
const authenticateToken = require("../middleware/auth.js");

router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search  = "" } = req.query;
    const memberId = req.user.member_id;
    await checkAndApplyFines(memberId);
    let books;

    // If there is a search query, use searchBooks
    if (search ) {
      books = await searchBooks(search );
    } else {
      // Otherwise, fetch all books
      books = await getAllBooks();
    }

    res.json({ success: true, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "Error retrieving books" });
  }
});



module.exports = router;
