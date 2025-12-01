import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";
import "./Books.css";

const Books = () => {

  // Books loaded from backend
  const [books, setBooks] = useState([]);

  // Book selected for viewing details
  const [selectedBook, setSelectedBook] = useState(null);

  // Search field input (changes immediately)
  const [searchQuery, setSearchQuery] = useState("");

  // Debounced search value (updates after user stops typing)
  const [debouncedQuery, setDebouncedQuery] = useState("");

  /* ----------------------------------------------------------
     1. LOAD BOOKS FROM BACKEND
     ---------------------------------------------------------- */
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // Placeholder API call — replace with your backend URL
        const res = await fetch("http://localhost:5000/api/books");

        const data = await res.json();

        setBooks(data); // store data from backend

      } catch (err) {
        console.error("Failed to load books:", err);
      }
    };

    fetchBooks();
  }, []);

  /* ----------------------------------------------------------
     2. SEARCH DEBOUNCE (waits 500ms after typing)
     ---------------------------------------------------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /* ----------------------------------------------------------
     3. FILTER BOOKS BASED ON SEARCH
     ---------------------------------------------------------- */
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
    book.authors.toLowerCase().includes(debouncedQuery.toLowerCase())
  );

  const isTyping = searchQuery !== debouncedQuery;

  /* ----------------------------------------------------------
     4. RENDER UI
     ---------------------------------------------------------- */
  return (
    <div className="books-wrapper">
      <h2 className="books-title">Library Books</h2>

      {/* ------------------------ SEARCH BAR ------------------------ */}
      <div className="search-container">

        <input
          type="text"
          className="search-input"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery("");
              setDebouncedQuery("");
            }}
          >
            X
          </button>
        )}
      </div>

      {/* ------------------------ BOOK GRID ------------------------ */}
      <div className="books-grid">

        {/* Backend returned no books */}
        {books.length === 0 ? (
          <p className="loading-text">Loading books...</p>

        /* Waiting for debounce while typing */
        ) : isTyping ? (
          <p className="loading-text">Searching...</p>

        /* No matches */
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <p>No books found matching "<strong>{debouncedQuery}</strong>"</p>
          </div>

        /* Show filtered books */
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

      {/* ------------------------ BOOK DETAILS MODAL ------------------------ */}
      {selectedBook && (
        <BookDetails
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Books;
