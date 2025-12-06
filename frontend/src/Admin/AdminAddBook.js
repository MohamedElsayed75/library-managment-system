import React, { useState } from "react";
import "./Admin.css";

/////////////////////////////
// AdminAddBook Component
/////////////////////////////
const AdminAddBook = ({ member }) => {
  /////////////////////////////
  // Local State
  /////////////////////////////
  const [newBook, setNewBook] = useState({
    isbn: "",
    title: "",
    genre: "",
    language: "",
    author: "",
    year: "",
    publisher: ""
  });
  const [message, setMessage] = useState({ text: "", type: "" });

  /////////////////////////////
  // Handle Input Change
  /////////////////////////////
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBook({ ...newBook, [name]: value });
  };

  /////////////////////////////
  // Handle Add Book
  /////////////////////////////
  const handleAddBook = async (e) => {
    e.preventDefault();

    if (!newBook.title || !newBook.author) {
      setMessage({ text: "Please fill in both Book Title and Author.", type: "error" });
      return;
    }

    const payload = {
      newBook,
      member_id: member.member_id
    };

    try {
      console.log(payload);
      const res = await fetch("http://localhost:5000/admin/addBook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ text: "Error adding book: " + data.message, type: "error" });
        return;
      }

      setMessage({ text: "Book added successfully!", type: "success" });

      // Reset form
      setNewBook({
        isbn: "",
        title: "",
        genre: "",
        language: "",
        author: "",
        year: "",
        publisher: ""
      });

    } catch (err) {
      console.error("Error adding book:", err);
      setMessage({ text: "An unexpected error occurred.", type: "error" });
    }
  };

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="admin-section">
      <h3>Add New Book</h3>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleAddBook} className="add-book-form">
        <input type="text" name="isbn" placeholder="ISBN"
          value={newBook.isbn} onChange={handleInputChange} />

        <input type="text" name="title" placeholder="Book Title"
          value={newBook.title} onChange={handleInputChange} required />

        <input type="text" name="genre" placeholder="Genre"
          value={newBook.genre} onChange={handleInputChange} />

        <input type="text" name="language" placeholder="Language"
          value={newBook.language} onChange={handleInputChange} />

        <input type="text" name="author" placeholder="Author Name"
          value={newBook.author} onChange={handleInputChange} required />

        <input type="text" name="publisher" placeholder="Publisher"
          value={newBook.publisher} onChange={handleInputChange} />

        <input type="number" name="year" placeholder="Publication Year"
          value={newBook.year} onChange={handleInputChange} />

        <button type="submit" className="add-btn">Add Book</button>
      </form>
    </div>
  );
};

/////////////////////////////
// Export AdminAddBook
/////////////////////////////
export default AdminAddBook;
