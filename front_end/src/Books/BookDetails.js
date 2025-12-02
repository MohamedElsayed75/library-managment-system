import React from "react";

const BookDetails = ({ book, onClose }) => {

  // --- WHEN USER BORROWS A BOOK ---
  const handleBorrow = () => {
    const stored = JSON.parse(localStorage.getItem("borrowedBooks") || "[]");

    // prevent duplicates
    const alreadyBorrowed = stored.find((b) => b.id === book.id);
    if (alreadyBorrowed) {
      alert("You already borrowed this book!");
      return;
    }

    const newBorrow = {
      id: book.id,
      title: book.title,
      daysRemaining: 14, // Example: 14 days return time
      dateBorrowed: new Date().toLocaleDateString()
    };

    const updated = [...stored, newBorrow];
    localStorage.setItem("borrowedBooks", JSON.stringify(updated));

    alert(`You borrowed: ${book.title}`);
    onClose();
  };

  // --- WHEN USER REQUESTS A BOOK ---
  const handleRequest = () => {
    const stored = JSON.parse(localStorage.getItem("requestedBooks") || "[]");

    // avoid duplicates
    const alreadyReq = stored.find((b) => b.id === book.id);
    if (alreadyReq) {
      alert("You already requested this book!");
      return;
    }

    const newRequest = {
      id: book.id,
      title: book.title,
      status: "Requested",
      date: new Date().toLocaleDateString(),
    };

    const updated = [...stored, newRequest];
    localStorage.setItem("requestedBooks", JSON.stringify(updated));

    alert(`You Requested: ${book.title}`);
    onClose();
  };

  return (
    <div className="book-details-overlay">
      <div className="book-details-box">

        <button className="close-btn" onClick={onClose}>X</button>

        <h2>{book.title}</h2>

        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Publication Year:</strong> {book.publication_year}</p>
        <p><strong>Author(s):</strong> {book.authors}</p>
        <p><strong>Publisher:</strong> {book.publisher_name}</p>
        <p><strong>Number of Copies:</strong> {book.available_copies}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={book.available_copies > 0 ? "available" : "not-available"}>
            {book.available_copies > 0 ? "Available" : "Not Available"}
          </span>
        </p>

        {book.available_copies > 0 && (
          <button className="borrow-btn" onClick={handleBorrow}>
            Borrow
          </button>
        )}

        {book.available_copies === 0 && (
          <button className="Register-btn" onClick={handleRequest}>
            Request
          </button>
        )}

      </div>
    </div>
  );
};

export default BookDetails;
