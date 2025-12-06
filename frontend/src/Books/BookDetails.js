import React, { useState } from "react";

const BookDetails = ({ book, member, refresh, onClose }) => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isBorrowing, setIsBorrowing] = useState(false);
  const [isReserving, setIsReserving] = useState(false); // new state for reservation

  /////////////////////////////
  // Borrow Book
  /////////////////////////////
  const handleBorrow = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsBorrowing(true);

    try {
      const res = await fetch("http://localhost:5000/user/borrow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id, member_id: member.member_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Could not borrow book.");
        setIsBorrowing(false);
        return;
      }

      setSuccessMessage(`You borrowed: ${book.title}`);

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
  // Reserve Book
  /////////////////////////////
  const handleReserve = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setIsReserving(true);

    try {
      const res = await fetch("http://localhost:5000/user/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: book.book_id, member_id: member.member_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || "Could not reserve book.");
        setIsReserving(false);
        return;
      }

      setSuccessMessage(`You reserved: ${book.title}`);

      setTimeout(() => {
        onClose();
        refresh();
      }, 1500);
    } catch (err) {
      console.error("Reserve request failed:", err);
      setErrorMessage("Error: unable to reserve book.");
      setIsReserving(false);
    }
  };

  return (
    <div className="book-details-overlay">
      <div className="book-details-box">
        <button className="close-btn" onClick={onClose}>X</button>

        <h2>{book.title}</h2>
        <p><strong>ISBN:</strong> {book.isbn}</p>
        <p><strong>Genre:</strong> {book.genre}</p>
        <p><strong>Language:</strong> {book.language}</p>
        <p><strong>Publication Year:</strong> {book.publication_year}</p>
        <p><strong>Author:</strong> {book.author_name}</p>
        <p><strong>Publisher:</strong> {book.publisher_name}</p>
        <p><strong>Copies:</strong> {book.copy_count}</p>

        <p>
          <strong>Status:</strong>{" "}
          <span className={book.copy_count > 0 ? "available" : "not-available"}>
            {book.copy_count > 0 ? "Available" : "Not Available"}
          </span>
        </p>

        {errorMessage && <p style={{ color: "red", marginTop: "10px" }}>{errorMessage}</p>}
        {successMessage && <p style={{ color: "green", marginTop: "10px" }}>{successMessage}</p>}

        {/* Borrow Button */}
        {book.copy_count > 0 && (
          <button
            className="borrow-btn"
            onClick={handleBorrow}
            disabled={isBorrowing}
          >
            {isBorrowing ? "Borrowing..." : "Borrow"}
          </button>
        )}

        {/* Reserve Button */}
        {book.copy_count === 0 && (
          <button
            className="Reserve-btn"
            onClick={handleReserve}
            disabled={isReserving}
          >
            {isReserving ? "Reserving..." : "Reserve Book"}
          </button>
        )}
      </div>
    </div>
  );
};

export default BookDetails;
