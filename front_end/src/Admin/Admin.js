import React, { useState, useEffect } from "react";
import "./Admin.css";

const Admin = () => {
  // 1. STATE: To hold the list of books for the admin to manage
  const [books, setBooks] = useState([]);
  
  // 2. STATE: To hold the form data (what the admin is typing)
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    image: ""
  });

  // Load the initial books (Simulating fetching from database)
  useEffect(() => {
    fetch("https://gutendex.com/books")
      .then(res => res.json())
      .then(data => {
        // We just take the first 10 for the admin demo to keep it clean
        const simpleList = data.results.slice(0, 10).map(b => ({
            id: b.id,
            title: b.title,
            author: b.authors[0]?.name || "Unknown",
            image: b.formats["image/jpeg"]  
        }));
        setBooks(simpleList);
      });
  }, []);

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