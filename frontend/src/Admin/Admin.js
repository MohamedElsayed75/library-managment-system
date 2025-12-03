import React, { useState, useEffect } from "react";
import "./Admin.css";

const Admin = () => {
  // --- STATE: List of books to manage ---
  const [books, setBooks] = useState([]);

  // --- STATE: Form data for adding a new book ---
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    image: ""
  });

  // --- EFFECT: Load books from backend on component mount ---
  useEffect(() => {
    // TODO: BACKEND - Replace with fetch from your Node.js/Express API
    // Example:
    // fetch("/api/books")
    //   .then(res => res.json())
    //   .then(data => setBooks(data));

    // Placeholder for backend call
    console.log("Fetch books from backend here");

  }, []);

  // --- FUNCTION: Handle input change for form fields ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  // --- FUNCTION: Add a new book ---
  const handleAddBook = (e) => {
    e.preventDefault(); // Prevent page refresh

    // TODO: BACKEND - Send POST request to add a new book
    // Example:
    // fetch("/api/books", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(newBook)
    // }).then(...)

    console.log("Send new book to backend:", newBook);

    // OPTIONAL: Update UI optimistically (if desired)
    // const mockBook = { id: Date.now(), ...newBook };
    // setBooks([mockBook, ...books]);

    // Reset form
    setNewBook({ title: "", author: "", image: "" });
  };

  // --- FUNCTION: Delete a book ---
  const handleDelete = (id) => {
    // TODO: BACKEND - Send DELETE request to remove book
    // Example:
    // fetch(`/api/books/${id}`, { method: "DELETE" }).then(...)

    console.log("Request backend to delete book with ID:", id);

    // OPTIONAL: Update UI optimistically
    // setBooks(books.filter(book => book.id !== id));
  };

  return (
    <div className="admin-container">
      <h2>Admin Panel</h2>

      {/* --- ADD NEW BOOK FORM --- */}
      <div className="admin-section">
        <h3>Add New Book</h3>
        <form onSubmit={handleAddBook} className="add-book-form">
          <input 
            type="text" 
            name="title" 
            placeholder="Book Title" 
            value={newBook.title}
            onChange={handleInputChange} 
            required 
          />
          <input 
            type="text" 
            name="author" 
            placeholder="Author Name" 
            value={newBook.author}
            onChange={handleInputChange} 
            required 
          />
          <input 
            type="text" 
            name="image" 
            placeholder="Image URL (optional)" 
            value={newBook.image}
            onChange={handleInputChange} 
          />
          <button type="submit" className="add-btn">Add Book</button>
        </form>
      </div>

      {/* --- MANAGE EXISTING BOOKS --- */}
      <div className="admin-section">
        <h3>Existing Books</h3>
        <div className="admin-book-list">
          {books.map(book => (
            <div key={book.id} className="admin-book-item">
              <img src={book.image} alt="cover" className="admin-book-thumb" />
              <div className="admin-book-info">
                <strong>{book.title}</strong>
                <span>{book.author}</span>
              </div>
              <button 
                className="delete-btn" 
                onClick={() => handleDelete(book.id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Admin;
