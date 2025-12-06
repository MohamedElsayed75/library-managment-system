const express = require("express");
const router = express.Router();

const { 
    getAllBooks,
    deleteBook,
    createBook,
    createCopy
} = require("../database/database.js");

router.get("/books", async (req, res) => {
    try {
        const books = await getAllBooks();
        res.json({ success: true, books });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errorMessage: "Error retrieving books" });
    }
});

router.post("/addBook", async (req, res) => {
  try {
    const newBook = req.body.newBook; // directly from frontend
    const member_id = req.body.member_id;

    // Call the service
    const result = await createBook(newBook, member_id);

    return res.status(201).json({
      message: "Book added successfully",
    });

  } catch (err) {
    console.error("Error adding book:", err);
    return res.status(500).json({ message: "Server error while adding book" });
  }
});


router.post("/addCopy/:book_id", async (req, res) => {
    try {
        const { book_id } = req.params; // use params instead of body
        await createCopy(book_id);
        res.json({ success: true, message: "Copy added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, errorMessage: "Error adding copy" });
    }
});

router.post("/deleteBook", async (req, res) => {
   
});


module.exports = router;