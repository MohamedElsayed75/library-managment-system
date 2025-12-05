const express = require("express");
const router = express.Router();

const {
  getAllBooks,
  searchBooks,
  getBookById
} = require("../database/database.js");

const authenticateToken = require("../middleware/auth.js");

// GET /books?search=
// Returns all books, or filtered books if search is provided
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search  = "" } = req.query;

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


// GET /books/:id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const bookId = req.params.id;
    const book = await getBookById(bookId);

    if (!book) {
      return res.status(404).json({ success: false, errorMessage: "Book not found" });
    }

    res.json({ success: true, book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "Error retrieving book" });
  }
});

// POST /books
router.post("/", authenticateToken, async (req, res) => {
  try {
    const newBook = await createBook(req.body);
    res.status(201).json({ success: true, book: newBook });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "Error creating book" });
  }
});

// DELETE /books/:id
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await deleteBook(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, errorMessage: "Book not found" });
    }
    res.json({ success: true, message: "Book deleted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, errorMessage: "Error deleting book" });
  }
});

module.exports = router;
