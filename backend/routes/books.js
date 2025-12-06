const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  searchBooks,
  checkAndApplyFines
} = require("../database/database.js");
const authenticateToken = require("../middleware/auth.js");

/////////////////////////////
// GET Books (with optional search)
/////////////////////////////
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const memberId = req.user.member_id;

    await checkAndApplyFines(memberId);

    const books = search ? await searchBooks(search) : await getAllBooks();

    res.json({ success: true, books });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "Error retrieving books" });
  }
});

/////////////////////////////
// Export Router
/////////////////////////////
module.exports = router;
