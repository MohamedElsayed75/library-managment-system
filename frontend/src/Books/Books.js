import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "../services/api";
import BookCard from "./BookCard";
import BookDetails from "./BookDetails";
import "./Books.css";

const Books = ({member}) => {

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/books?search=${searchQuery}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();

      if (data.success) {
        setBooks(data.books);
      } else {
        setBooks([]);
      }
    } catch (err) {
      console.error("Failed to fetch books", err);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  // Load all books on page load
  useEffect(() => {
    fetchBooks();
  }, []);

  // Auto-search when user types (debounced)
  useEffect(() => {
    const delay = setTimeout(fetchBooks, 500);
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
        {loading ? (
          <p className="loading-text">Loading library catalog...</p>
        ) : books.length === 0 ? (
          <div className="no-results">
            <p>No books found matching your search.</p>
          </div>
        ) : (
          books.map((book) => (
            <BookCard
              key={book.book_id}
              book={book}
              member={member}
              onClick={() => setSelectedBook(book)}
            />
          ))
        )}
      </div>

      {selectedBook && (
        <BookDetails book={selectedBook} member={member} onClose={() => setSelectedBook(null)} />
      )}
    </div>
  );
};

export default Books;
