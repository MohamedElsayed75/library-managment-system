import React from "react";

const BookCard = ({ book, onClick }) => {
  return (
    // Entire card is clickable → triggers onClick (opens details)
    <div className="book-card" onClick={onClick}>

      {/* ------------------------ BOOK IMAGE ------------------------ */}
      {book.image ? (
        <img
          src={book.image}
          alt={book.title}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "5px"
          }}
        />
      ) : (
        // Placeholder when no image exists
        <div
          style={{
            height: "200px",
            background: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "5px"
          }}
        >
          No Image
        </div>
      )}

      {/* ------------------------ BOOK INFO ------------------------ */}
      <h3>{book.title}</h3>

      <p>
        <strong>Author:</strong> {book.authors}
      </p>

      <p>
        <strong>Year:</strong> {book.year}
      </p>

      {/* ------------------------ AVAILABILITY BADGE ------------------------ */}
      <span className={book.copies > 0 ? "available" : "not-available"}>
        {book.copies > 0 ? "Available" : "Unavailable"}
      </span>

    </div>
  );
};

export default BookCard;
