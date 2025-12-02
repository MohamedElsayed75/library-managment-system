import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";
import "./Books.css";

const Books = () => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // --- NEW STATE: SELECTED CATEGORY ---
  // We start with "All" to show everything initially
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchAllBooks();
  }, []);

  // --- DEBOUNCE TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timer);
    };
  }, [searchQuery]);

  /* TODO: REMOVE DUMMY DATA GENERATE OWN DUMMY DATA. */
  const fetchAllBooks = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/books");
      const data = await res.json();
      setBooks(data);
      }
     catch (err) {
      console.error("Failed to fetch books", err);
    }
  };


  /* I think this also needs to get changed? */

  // --- GET UNIQUE CATEGORIES ---
  // This looks at all loaded books and extracts a list of unique genres
  // We add "All" at the start so the user can reset the filter
  const categories = ["All", ...new Set(books.map((b) => b.genre))];

  // --- UPDATED FILTERING LOGIC ---
  const filteredBooks = books.filter((book) => {
  const title = book.title?.toLowerCase() || "";
  const genre = book.genre || "";
  const q = debouncedQuery.toLowerCase();

  const matchesSearch = title.includes(q);

  const matchesCategory =
    selectedCategory === "All" || genre === selectedCategory;

  return matchesSearch && matchesCategory;
});



  const isTyping = searchQuery !== debouncedQuery;

  return (
    <div className="books-wrapper">
      <h2 className="books-title">Library Books</h2>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="search-container">
        
        {/* 1. Text Input */}
        <input
          type="text"
          className="search-input"
          placeholder="Search by title or author..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* 2. Category Dropdown (NEW) */}
        <select
          className="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat, index) => (
            <option key={index} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* 3. Clear Button */}
        {(searchQuery || selectedCategory !== "All") && (
          <button
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery("");
              setDebouncedQuery("");
              setSelectedCategory("All"); // Reset category too
            }}
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
          <div className="loading-text">Searching...</div>
        ) : filteredBooks.length === 0 ? (
          <div className="no-results">
            <p>
              No books found matching "<strong>{debouncedQuery}</strong>" in{" "}
              <strong>{selectedCategory}</strong>
            </p>
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