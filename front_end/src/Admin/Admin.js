import React, { useState, useEffect } from "react";
import "./Admin.css";

const Admin = () => {
  // 1. STATE: To hold the list of books for the admin to manage
  const [books, setBooks] = useState([]);
  
  // BookId is not fucking auto increment KILL MEEEEE.
  // Books: book_id, publisher_id, isbn, title, genre, language, publication_year.
  // Maybe use joins to add publisher_name and author_id/name?
  // 2. STATE: To hold the form data (what the admin is typing)
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    genre: "",
    language: "",
    year: "", 
    author: "",
    genre: "",
    image: ""
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
        year: b.publication_year,           
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
    setNewBook({ ...newBook, [name]: value });
  };

  // --- FUNCTION: ADD BOOK (MOCK) ---
  const handleAddBook = (e) => {
    e.preventDefault(); // Stop page refresh

    // TODO: BACKEND - Send POST request to /api/books
    console.log("Mock Adding Book:", newBook);

    // Update the UI immediately so the admin sees the result
    const mockBook = {
        id: Date.now(), // Generate a fake ID
        ...newBook
    };
    
    // Add to top of list
    setBooks([mockBook, ...books]); 
    
    // Reset form
    setNewBook({ title: "", author: "", image: "" });
    alert("Book Added (Mock)!");
  };

  // --- FUNCTION: DELETE BOOK (MOCK) ---
  const handleDelete = (id) => {
    // TODO: BACKEND - Send DELETE request to /api/books/${id}
    console.log("Mock Deleting Book ID:", id);

    // Filter out the deleted book from the UI
    const updatedList = books.filter(book => book.id !== id);
    setBooks(updatedList);
    
    alert("Book Deleted (Mock)!");
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
                name="isbn" 
                placeholder="ISBN " 
                value={newBook.isbn}
                onChange={handleInputChange} 
            />
            <input 
                type="text" 
                name="year" 
                placeholder="Publication Year" 
                value={newBook.year}
                onChange={handleInputChange} 
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
                placeholder="Language (optional)" 
                value={newBook.language}
                onChange={handleInputChange} 
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