const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.js");
//database import 
const { 
  createTransaction, 
  hasOverdueTransactions, 
  getProfileData, 
  returnTransaction,
  checkAndApplyFines,
  payFines
 } = require("../database/database.js");

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


router.get("/profile", async (req, res) => {
  const memberId = req.query.memberId;

  if (!memberId) {
    return res.status(400).json({ error: "Member ID is required" });
  }

  await checkAndApplyFines(memberId);

  try {
    const profileData = await getProfileData(memberId);

    if (!profileData) {
      return res.status(404).json({ error: "Member not found" });
    }

    res.json({
      amountOwed: profileData.totalFines,
      borrowedBooks: profileData.borrowedBooks,
      reservedBooks: profileData.reservedBooks
    });

  } catch (err) {
    console.error("Error fetching profile data:", err);
    res.status(500).json({ error: "Profile route error" });
  }
});


router.post("/return", async (req, res) => {
  try {
      const transactionId = req.query.transactionId;
      const result = await returnTransaction(transactionId);

      if (result.error) {
        return res.status(400).json({ message: result.error });
      }

      return res.json({ message: "Book returned successfully" });

  } catch (error) {
      console.error("Return route error:", error);
      return res.status(500).json({ message: "Server error while returning the book" });
  }
});

router.post("/payfines", async (req, res) => {
  try {
      const memberId = req.body.memberId;

      await payFines(memberId);

      return res.json({ message: "Fines paid successfully" });
      
  } catch (error) {
      console.error("Pay fines route error:", error);
      return res.status(500).json({ message: "Server error while paying fines" });
  }
});

module.exports = router;