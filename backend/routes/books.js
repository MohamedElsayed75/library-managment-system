const express = require("express");
const router = express.Router();

const {
  searchBooks,
  checkAndApplyFines
} = require("../database/database.js");
const authenticateToken = require("../middleware/auth.js");

/////////////////////////////
// GET Books
/////////////////////////////
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search = "" } = req.query;
    const memberId = req.user.member_id;

    await checkAndApplyFines(memberId);

    const books =  await searchBooks(search);

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
