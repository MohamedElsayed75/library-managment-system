import React, { useState } from "react";

/////////////////////////////
// BookDetails Component
/////////////////////////////
const BookDetails = ({ book, member, refresh, onClose }) => {
  /////////////////////////////
  // Local State
  /////////////////////////////
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);

  /////////////////////////////
  // Handle Borrow Book
  /////////////////////////////
  const handleBorrow = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsBorrowing(true);

    try {
      const res = await fetch("http://localhost:5000/user/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          book_id: book.book_id,
          member_id: member.member_id
        }), 
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Could not borrow book.");
        setIsBorrowing(false);
        return;
      }

      setSuccessMessage(`You borrowed: ${book.title}`);
      setIsBorrowing(false);

      // Close popup and refresh after short delay
      setTimeout(() => {
        onClose();
        refresh();
      }, 1500);
    } catch (err) {
      console.error("Borrow request failed:", err);
      setErrorMessage("Error: unable to borrow book.");
      setIsBorrowing(false);
    }
  };

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="book-details-overlay">
      <div className="book-details-box">
        {/* Close popup */}
        <button className="close-btn" onClick={onClose}>X</button>

        <h2>{book.title}</h2>

        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Language:</strong> {book.language}</p>
        <p><strong>Publication Year:</strong> {book.publication_year}</p>
        <p><strong>Author:</strong> {book.author_name}</p>
        <p><strong>Publisher:</strong> {book.publisher_name}</p>
        <p><strong>Copies:</strong> {book.copy_count}</p>

        {/* Availability status */}
        <p>
          <strong>Status:</strong>{" "}
          <span className={book.copy_count > 0 ? "available" : "not-available"}>
            {book.copy_count > 0 ? "Available" : "Not Available"}
          </span>
        </p>

        {/* Error message */}
        {errorMessage && (
          <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>
        )}

        {/* Success message */}
        {successMessage && (
          <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>
        )}

        {/* Borrow button */}
        {book.copy_count > 0 && (
          <button
            className="borrow-btn"
            onClick={handleBorrow}
            disabled={isBorrowing}
          >
            {isBorrowing ? "Borrowing..." : "Borrow"}
          </button>
        )}

        {/* No copies message */}
        {book.copy_count === 0 && (
          <p style={{ color: "#777", marginTop: "10px" }}>
            No copies available to borrow.
          </p>
        )}
      </div>
    </div>
  );
};

/////////////////////////////
// Export BookDetails
/////////////////////////////
export default BookDetails;
