const BookCard = ({ book, member, onClick }) => {
  // Build OpenLibrary cover URL
  const coverUrl = book.isbn
    ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
    : null;

  return (
    <div className="book-card" onClick={onClick}>
      
      {/* ------------------------ BOOK IMAGE ------------------------ */}
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={book.title}
          onError={(e) => {
            e.target.onerror = null;
            e.target.style.display = "none"; // hide broken image
          }}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "5px",
          }}
        />
      ) : (
        <div
          style={{
            height: "200px",
            background: "#ddd",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "5px",
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
        <strong>Year:</strong> {book.publication_year}
      </p>

      {/* ------------------------ AVAILABILITY BADGE ------------------------ */}
      <span className={book.copy_count > 0 ? "available" : "not-available"}>
        {book.copy_count > 0 ? "Available" : "Unavailable"}
      </span>
    </div>
  );
};

export default BookCard;
