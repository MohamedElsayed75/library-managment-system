//booklogic.js
const express = require("express");
const router = express.Router();
const {connect} = require("./db");

// Get book from db
router.get("/books", async(req,res) => {
    try{
        const conn = await connect();
        const [rows] = await conn.query(`
            SELECT 
                b.book_id,
                b.isbn,
                b.title,
                b.genre,
                b.language,
                b.publication_year,
                p.name AS publisher_name,
                GROUP_CONCAT(DISTINCT a.name) AS authors,
                COUNT(DISTINCT bc.copy_id) AS total_copies,
                COUNT(CASE WHEN bc.availability = 1 THEN 1 END) AS available_copies
            FROM books b
            LEFT JOIN publishers p ON b.publisher_id = p.publisher_id
            LEFT JOIN bookauthor ba ON b.book_id = ba.book_id
            LEFT JOIN author a ON ba.author_id = a.author_id
            LEFT JOIN bookcopies bc ON b.book_id = bc.book_id
            GROUP BY b.book_id
        `);        
        res.json(rows);
    } catch(err){
        console.error("Failed to get books:" ,err);
        res.status(500).json({message: "Server error getting books."});
    }
}); 

// Add book
router.post("/books", async(req,res) => {   
    const{
        isbn,
        title,
        genre,
        language,
        publication_year,
        publisher_id,
        authors,
        copies
    } = req.body;

  try {
    const conn = await connect();

    // 1) Find or create publisher
    let publisher_id = null;
    if (publisher) {
      const [pubRows] = await conn.query(
        `SELECT publisher_id FROM publishers WHERE name = ? LIMIT 1`,
        [publisher]
      );
      if (pubRows.length > 0) {
        publisher_id = pubRows[0].publisher_id;
      } else {
        const [insPub] = await conn.query(
          `INSERT INTO publishers (name) VALUES (?)`,
          [publisher]
        );
        publisher_id = insPub.insertId;
      }
    }

    // 2) Insert book
    const [bookInsert] = await conn.query(
      `INSERT INTO books (publisher_id, isbn, title, genre, language, publication_year)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [publisher_id, isbn, title, genre, language, publication_year]
    );
    const bookId = bookInsert.insertId;

    // 3) Find or create author (single author string)
    if (author) {
      const [authRows] = await conn.query(
        `SELECT author_id FROM author WHERE name = ? LIMIT 1`,
        [author]
      );
      let author_id;
      if (authRows.length > 0) {
        author_id = authRows[0].author_id;
      } else {
        const [insAuth] = await conn.query(
          `INSERT INTO author (name) VALUES (?)`,
          [author]
        );
        author_id = insAuth.insertId;
      }

      // Link book <-> author
      await conn.query(
        `INSERT INTO bookauthor (book_id, author_id) VALUES (?, ?)`,
        [bookId, author_id]
      );
    }

    // 4) Insert copies
    const numCopies = parseInt(copies, 10) || 0;
    if (numCopies > 0) {
      const copyInsertPromises = [];
      for (let i = 0; i < numCopies; i++) {
        copyInsertPromises.push(
          conn.query(
            `INSERT INTO bookcopies (book_id, availability) VALUES (?, 1)`,
            [bookId]
          )
        );
      }
      await Promise.all(copyInsertPromises);
    }

    res.json({ message: "Book added successfully", book_id: bookId });
  } catch (err) {
    console.error("Failed to add book:", err);
    res.status(500).json({ message: "Server error adding book.", error: String(err) });
  }
});
router.delete("/books/:id", async(req,res) => {
    const book_id = req.params.id;
    try{
        // Delete connections first.
        const conn = await connect();
        await conn.query("DELETE FROM bookauthor WHERE book_id = ?", [book_id]);
        await conn.query("DELETE FROM bookcopies WHERE book_id = ?", [book_id]);
        await conn.query("DELETE FROM books WHERE book_id = ?", [book_id]);
       // Delete book
       const [result] = await conn.query("DELETE FROM books WHERE book_id = ?", [book_id]);
        res.json({message: "Book deleted."});

        if (result.affectedRows === 0){
            res.status(404).json({message: "Book not found."});
        }
        
    } catch(err){
        console.error("Failed to delete book:", err);
        res.status(500).json({message: "Server error deleting book."});
    }
});
module.exports = router;