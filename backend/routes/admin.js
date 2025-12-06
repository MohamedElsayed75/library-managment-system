const express = require("express");
const router = express.Router();

const { 
    getAllBooks,
    createBook,
    createCopy,
    deleteAvailableCopy,
    giveBookToNextReserver
} = require("../database/database.js");

/////////////////////////////
// GET All Books
/////////////////////////////
router.get("/books", async (req, res) => {
    try {
        const books = await getAllBooks();
        res.json({ success: true, books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errorMessage: "Error retrieving books" });
    }
});

/////////////////////////////
// POST Add New Book
/////////////////////////////
router.post("/addBook", async (req, res) => {
    try {
        const newBook = req.body.newBook;
        const member_id = req.body.member_id;

        await createBook(newBook, member_id);

        return res.status(201).json({ message: "Book added successfully" });
    } catch (err) {
        console.error("Error adding book:", err);
        return res.status(500).json({ message: "Server error while adding book" });
    }
});

/////////////////////////////
// POST Add Copy
/////////////////////////////
router.post("/addCopy", async (req, res) => {
  try {
    const { book_id, member_id } = req.body;

    await createCopy(book_id, member_id);

    const response = await giveBookToNextReserver(book_id);

    if (response.success) {
      res.json({ success: true, message: response.message });
    } else {
      res.json({ success: false, message: response.error });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding copy" });
  }
});

/////////////////////////////
// DELETE Copy
/////////////////////////////
router.delete("/deleteCopy", async (req, res) => {
    const { bookId, memberId } = req.body;

    try {
        const result = await deleteAvailableCopy(bookId, memberId);

        if (!result.success) {
            return res.status(
                result.message.includes("No available") ? 404 : 500
            ).json(result);
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Route error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error deleting copy."
        });
    }
});

/////////////////////////////
// Export Router
/////////////////////////////
module.exports = router;
