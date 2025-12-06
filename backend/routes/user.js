const express = require("express");
const router = express.Router();

const { 
  createTransaction, 
  hasOverdueTransactions,

  hasReachedBorrowLimit,
  hasBorrowedBook,
  returnTransaction,

  isBookReservedByMember,
  reserveBook,
  cancelReservation,

  getProfileData, 
  
  checkAndApplyFines,
  payFines
} = require("../database/database.js");

/////////////////////////////
// POST Borrow Book
/////////////////////////////
router.post("/borrow", async (req, res) => {
    try {
        const book_id  = req.body.book_id;
        const member_id = req.body.member_id;
        
        // Check if the book has already been borrowed
        const hasBorrowedBookBefore = await hasBorrowedBook(member_id, book_id);
        if (hasBorrowedBookBefore) {
            return res.status(400).json({ message: "You have already borrowed this book." });
        }

        // Check for overdue transactions
        const hasOverdue = await hasOverdueTransactions(member_id);
        if (hasOverdue) {
            return res.status(400).json({ message: "Cannot borrow books while you have overdue transaction(s)." });
        }

        // Check borrow limit
        const hasReachedLimit = await hasReachedBorrowLimit(member_id); 
        if (hasReachedLimit) {
            return res.status(400).json({ message: "You have reached your borrow limit of 3 books." });
        }

        // Create borrow transaction
        const result = await createTransaction(member_id, book_id);

        if (result.error) return res.status(400).json({ message: result.error });

        return res.json({ message: "Book borrowed successfully" });
    } catch (error) {
        console.error("Borrow route error:", error);
        return res.status(500).json({ message: "Server error while borrowing the book" });
    }
});


/////////////////////////////
// POST Reserve Book
/////////////////////////////
router.post("/reserve", async (req, res) => {
  try {
      const book_id  = req.body.book_id;
      const member_id = req.body.member_id;

      // Check if the book has already been borrowed
      const hasBorrowedBookBefore = await hasBorrowedBook(member_id, book_id);
      if (hasBorrowedBookBefore) {
          return res.status(400).json({ message: "You have already borrowed this book." });
      }

      // Check if the book has already been reserved
      const isBookReserved = await isBookReservedByMember(member_id, book_id);
      if (isBookReserved) {
          return res.status(400).json({ message: "You have already reserved this book." });
      }

      // Check for overdue transactions
      const hasOverdue = await hasOverdueTransactions(member_id);
      if (hasOverdue) {
          return res.status(400).json({ message: "Cannot reserve books while you have overdue transaction(s)." });
      }

      // Check borrow limit
      const hasReachedLimit = await hasReachedBorrowLimit(member_id); 
      if (hasReachedLimit) {
          return res.status(400).json({ message: "You have reached your borrow limit of 3 books." });
      }

      const result = await reserveBook(member_id, book_id);

      if (result.error) return res.status(400).json({ message: result.error });

      return res.json({ message: "Book reserved successfully" });
  } catch (error) {
      console.error("Reserve route error:", error);
      return res.status(500).json({ message: "Server error while reserving the book." });
  }
});

/////////////////////////////
// POST Cancel Reservation
/////////////////////////////
router.post("/cancelReservation", async (req, res) => {
  try {
      const book_id  = req.body.book_id;
      const member_id = req.body.member_id;

      const result = await cancelReservation(member_id, book_id);

      if (result.error) return res.status(400).json({ message: result.error });

      return res.json({ message: "Reservation canceled successfully." });
  } catch (error) {
      console.error("Cancel route error:", error);
      return res.status(500).json({ message: "Server error while canceling the reservation." });
  }
});

/////////////////////////////
// GET Member Profile
/////////////////////////////
router.get("/profile", async (req, res) => {
  const memberId = req.query.memberId;

  await checkAndApplyFines(memberId);

  try {
    const profileData = await getProfileData(memberId);

    if (!profileData) return res.status(404).json({ error: "Member not found" });

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

/////////////////////////////
// POST Return Book
/////////////////////////////
router.post("/return", async (req, res) => {
  try {
      const transactionId = req.query.transactionId;
      const result = await returnTransaction(transactionId);

      if (result.error) return res.status(400).json({ message: result.error });

      return res.json({ message: "Book returned successfully" });
  } catch (error) {
      console.error("Return route error:", error);
      return res.status(500).json({ message: "Server error while returning the book" });
  }
});

/////////////////////////////
// POST Pay Fines
/////////////////////////////
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

/////////////////////////////
// Export Router
/////////////////////////////
module.exports = router;
