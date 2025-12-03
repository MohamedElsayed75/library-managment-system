import React from "react";

const BookDetails = ({ book, onClose }) => {

  /* ---------------------------------------------------------
     This just sends a request to the backend.
     Backend will:
     - check availability
     - reduce number of copies
     - create borrow record
     - return success/error
  --------------------------------------------------------- */
  const handleBorrow = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/books/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Could not borrow book.");
        return;
      }

      alert(`You borrowed: ${book.title}`);
      onClose();

    } catch (err) {
      console.error("Borrow request failed:", err);
      alert("Error: unable to borrow book.");
    }
  };


  return (
    <div className="book-details-overlay">
      <div className="book-details-box">

        {/* Close popup */}
        <button className="close-btn" onClick={onClose}>X</button>

        <h2>{book.title}</h2>

        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Publication Year:</strong> {book.year}</p>
        <p><strong>Author(s):</strong> {book.authors}</p>
        <p><strong>Publisher:</strong> {book.publisher}</p>
        <p><strong>Copies:</strong> {book.copies}</p>

        {/* Availability status */}
        <p>
          <strong>Status:</strong>{" "}
          <span className={book.copies > 0 ? "available" : "not-available"}>
            {book.copies > 0 ? "Available" : "Not Available"}
          </span>
        </p>

        {/* Borrow button only if copies are available */}
        {book.copies > 0 && (
          <button className="borrow-btn" onClick={handleBorrow}>
            Borrow
          </button>
        )}

        {/* If no copies, no request button anymore */}
        {book.copies === 0 && (
          <p style={{ color: "#777", marginTop: "10px" }}>
            No copies available to borrow.
          </p>
        )}

      </div>
    </div>
  );
};

export default BookDetails;
