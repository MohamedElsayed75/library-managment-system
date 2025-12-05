import React, { useState, useEffect } from "react";
import "./Admin.css";
const Admin = () => {
  // 1. STATE: To hold the list of books for the admin to manage
  const [books, setBooks] = useState([]);
  
  // BookId is not fucking auto increment KILL MEEEEE. It is now. :D
  // Books: book_id, publisher_id, isbn, title, genre, language, publication_year.
  // Maybe use joins to add publisher_name and author_id/name? Done. :D
  // 2. STATE: To hold the form data (what the admin is typing)
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    genre: "",
    language: "",
    publication_year: "", 
    author: "", 
    publisher: "", 
    copies: 1 
  });

  useEffect(() => {
    fetchAllBooks();
  }, []);

  // Load the initial books (Simulating fetching from database)
const fetchAllBooks = async () => {
    try {
      const res = await fetch("http://localhost:5001/api/books");
      const data = await res.json();
      
      const formatted = data.map(b => ({
        id: b.book_id,                     
        isbn: b.isbn,
        title: b.title,
        genre: b.genre,
        year: b.publication_year || "Unknown",  // Fucker is broken so I'm keeping him like that for now   
        language: b.language,
        authors: b.authors || "Unknown",     
        publisher: b.publisher_name || "Unknown",  
        copies: b.available_copies || 0,             
        image: b.image_url || null
      }));

      setBooks(formatted);
    } catch (err) {
      console.error("Failed to fetch books", err);
    }
  };

// TO DO: COMPLETE REST OF INFO IN ADD BOOK.
// ADD LOGIC FOR COPY INCREASE OR DECREASE IN ADMIN AND BOOKS.

  // --- FUNCTION: HANDLE INPUT CHANGE ---
  // This updates 'newBook' state whenever you type in the form
  const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewBook(prev => ({ ...prev, [name]: value }));
  };


 const handleAddBook = async (e) => {
  e.preventDefault(); // Stop page refresh
  try {
    const res = await fetch("http://localhost:5001/api/books", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, // Fixed: hyphen not space
      body: JSON.stringify({
        isbn: newBook.isbn,
        title: newBook.title,
        genre: newBook.genre,
        language: newBook.language,
        publication_year: newBook.publication_year,
        publisher_id: newBook.publisher_id, 
        authors: newBook.author,          // Changed from 'author' to 'authors' 
        copies: newBook.copies
      })      
    });

    const data = await res.json();

    if (res.ok) {
      alert("Book added!");
      fetchAllBooks();
      setNewBook({
        isbn: "",
        title: "",
        genre: "",
        language: "",
        publication_year: "", 
        author: "", 
        publisher: "", 
        copies: 1
      });
    } else {
      alert("Error adding book:" + data.message);
    }
  } catch (err) {
    console.error("Failed to add book", err);
  }
};
  // --- FUNCTION: DELETE BOOK (MOCK) ---
  const handleDelete = async(id) => {
    // TODO: BACKEND - Send DELETE request to /api/books/${id}
    try{
      const res = await fetch(`http://localhost:5001/api/books/${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok){
        alert("Booko deleted!");
        fetchAllBooks();
      } else{
        alert("Error deleting book:" + data.message);
      }
    } catch (err){
      console.error("Failed to delete book", err);
    }
  };

    return (
      <div className="admin-container">
        <h2>Admin Panel</h2>

        {/* --- PART 1: ADD BOOK FORM --- */}
        <div className="admin-section">
          <h3>Add New Book</h3>
          <form onSubmit={handleAddBook} className="add-book-form">
                <input 
                  type="text" 
                  name="isbn" 
                  placeholder="ISBN " 
                  value={newBook.isbn}
                  onChange={handleInputChange} 
              />
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
                  name="genre" 
                  placeholder="Genre" 
                  value={newBook.genre}
                  onChange={handleInputChange} 
              />
                <input 
                  type="text" 
                  name="language" 
                  placeholder="Language " 
                  value={newBook.language}
                  onChange={handleInputChange} 
              />
                <input 
                  type="text" 
                  name="publication_year" 
                  placeholder="Publication Year" 
                  value={newBook.publication_year}
                  onChange={handleInputChange} 
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
                  name="publisher" 
                  placeholder="Publisher" 
                  value={newBook.publisher}
                  onChange={handleInputChange} 
              />
              <button type="submit" className="add-btn">Add Book</button>
          </form>
        </div>

        {/* --- PART 2: MANAGE BOOKS LIST --- */}
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