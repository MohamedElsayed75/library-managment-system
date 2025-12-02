//booklogic.js
const express = require("express");
const router = express.Router();
const {connect} = require("./db");

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

module.exports = router;