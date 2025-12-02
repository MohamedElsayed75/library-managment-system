import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";
import "./Books.css";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // --- SEARCH STATE ---
  // 1. Tracks exactly what the user types in real-time
  const [searchQuery, setSearchQuery] = useState("");
  
  // 2. Tracks the value AFTER the user stops typing (triggered by timer)
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    fetchAllBooks();
  }, []);

  // --- DEBOUNCE TIMER ---
  // Updates debouncedQuery only after 500ms of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500); 

    // Cleanup: If user types again before 500ms, clear the old timer
    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const fetchAllBooks = async () => {
    try {
      const res = await fetch("https://gutendex.com/books");
      const data = await res.json();
      
// Inside fetchAllBooks function...
      const mapped = data.results.map((b) => {
        return {
          id: b.id,
          isbn: b.id + "",
          title: b.title,
          // --- NEW CODE: GRAB IMAGE ---
          image: b.formats["image/jpeg"], 
          // ----------------------------
          genre: b.bookshelves && b.bookshelves.length > 0 ? b.bookshelves[0] : "Unknown",
          year: b.download_count,
          authors: b.authors.map((a) => a.name).join(", "),
          publisher: "Unknown Publisher", 
          copies: Math.floor(Math.random() * 10),
        };
      });
      setBooks(mapped);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

  // --- FILTERING ---
  // We filter based on 'debouncedQuery' so the list doesn't jump around while typing
  const filteredBooks = books.filter((book) => 
    book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    book.authors.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  // Helper to know if we are "waiting" for the timer
  const isTyping = searchQuery !== debouncedQuery;

  return (
    <div className="books-wrapper">
      <h2 className="books-title">Library Books</h2>

      {/* --- SEARCH BAR UI --- */}
      <div className="search-container">
        <input 
          type="text" 
          className="search-input"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {/* 'X' Button appears only when there is text */}
        {searchQuery && (
          <button 
            className="clear-search-btn" 
            onClick={() => { setSearchQuery(""); setDebouncedQuery(""); }}
          >
            X
          </button>
        )}
      </div>

      {/* --- BOOKS GRID --- */}
      <div className="books-grid">
        {books.length === 0 ? (
          <p className="loading-text">Loading library catalog...</p>
        ) : isTyping ? ( 
          // Show "Searching..." while the debounce timer is running
          <div className="loading-text">Searching...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <p>No books found matching "<strong>{debouncedQuery}</strong>"</p>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onClick={() => setSelectedBook(book)}
            />
          ))
        )}
      </div>

      {selectedBook && (
        <BookDetails book={selectedBook} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Books;