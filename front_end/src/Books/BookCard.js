import React from "react";

// Maybe remove book card since how would we even add it?

const BookCard = ({ book, onClick }) => {
  return (
    <div className="book-card" onClick={onClick}>
      {/* --- NEW CODE: IMAGE DISPLAY --- */}
      {book.image ? (
        <img 
          src={book.image} 
          alt={book.title} 
          style={{ width: "100%", height: "200px", objectFit: "cover", borderRadius: "5px" }} 
        />
      ) : (
        <div style={{ height: "200px", background: "#ddd", display: "flex", alignItems: "center", justifyContent: "center" }}>
          No Image
        </div>
      )}
      {/* ------------------------------- */}

      <h3>{book.title}</h3>
     
      <p><strong>Publisher:</strong> {book.publisher_name}</p>
      {/* <p><strong>Genre:</strong> {book.genre}</p> */}
      <p><strong>Year:</strong> {book.publication_year}</p>

      <span className={book.available_copies > 0 ? "available" : "not-available"}>
        {book.available_copies > 0 ? "Available" : "Unavailable"}
      </span>
    </div>
  );
};

export default BookCard;