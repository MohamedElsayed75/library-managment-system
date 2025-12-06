import React, { useEffect, useState } from "react";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";
import "./Books.css";

const Books = ({ member }) => {
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBooks = async (query = "") => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/books?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBooks(data.success ? data.books : []);
    } catch (err) {
      console.error("Failed to fetch books", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all books on initial render
  useEffect(() => {
    fetchBooks();
  }, []);

  // Debounced search
  useEffect(() => {
    const delay = setTimeout(() => fetchBooks(searchQuery), 500);
    return () => clearTimeout(delay);
  }, [searchQuery]);

  return (
    <div className="books-wrapper">
      <h2 className="books-title">Library Books</h2>

      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search books by title, ISBN, genre, or language..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="books-grid">
        {books.map((book) => (
          <BookCard
            key={book.book_id}
            book={book}
            member={member}
            onClick={() => setSelectedBook(book)}
          />
        ))}

        {/* Overlay loading message without removing the grid */}
        {loading && (
          <div className="loading-overlay">
            <p>Loading library catalog...</p>
          </div>
        )}

        {/* Show "no results" only if not loading */}
        {!loading && books.length === 0 && (
          <div className="no-results">
            <p>No books found matching your search.</p>
          </div>
        )}
      </div>

      {selectedBook && (
        <BookDetails
          book={selectedBook}
          member={member}
          refresh={() => fetchBooks(searchQuery)}
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
};

export default Books;
