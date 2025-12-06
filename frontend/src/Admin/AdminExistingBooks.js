import React, { useEffect, useState } from "react";
import "./Admin.css";

/////////////////////////////
// AdminExistingBooks Component
/////////////////////////////
const AdminExistingBooks = ({ member }) => {
  /////////////////////////////
  // Local State
  /////////////////////////////
  const [books, setBooks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 10;

  const indexOfLast = currentPage * booksPerPage;
  const indexOfFirst = indexOfLast - booksPerPage;
  const currentBooks = books.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(books.length / booksPerPage);

  /////////////////////////////
  // Fetch All Books
  /////////////////////////////
  const fetchBooks = async () => {
    try {
      const res = await fetch("http://localhost:5000/admin/books");
      const data = await res.json();

      if (data.success) {
        setBooks(data.books);
      } else {
        console.error("Error fetching books:", data.errorMessage);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  /////////////////////////////
  // Add Copy
  /////////////////////////////
  const handleAddCopy = async (book_id, book_title) => {
    try {
      const res = await fetch("http://localhost:5000/admin/addCopy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id, member_id: member.member_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error adding copy: " + data.message);
        return;
      }

      alert("Copy added for " + book_title + " !");
      fetchBooks();
    } catch (err) {
      console.error("Error adding copy:", err);
    }
  };

  /////////////////////////////
  // Delete Copy
  /////////////////////////////
  const handleDelete = async (book_id) => {
    if (!window.confirm("Delete a copy of this book?")) return;

    try {
      const res = await fetch("http://localhost:5000/admin/deleteCopy", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId: book_id, memberId: member.member_id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Error deleting: " + data.message);
        return;
      }

      alert("Copy deleted.");
      fetchBooks();
    } catch (err) {
      console.error("Error deleting copy:", err);
    }
  };

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="admin-section">
      <h3>Existing Books</h3>

      <div className="admin-book-list">
        {currentBooks.map((book) => {
          const coverUrl = book.isbn
            ? `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
            : null;

          return (
            <div key={book.book_id} className="admin-book-item">
              {/* IMAGE */}
              {coverUrl ? (
                <img
                  src={coverUrl}
                  alt={book.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                  }}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}

              {/* BOOK DETAILS */}
              <div className="book-details">
                <strong>{book.title}</strong>
                <span>{book.author_name}</span>
                <small>ISBN: {book.isbn || "N/A"}</small>
                <p>
                  <strong>Copies:</strong> {book.copy_count}
                </p>
              </div>

              {/* ACTION BUTTONS */}
              <div className="book-actions">
                <button
                  className="add-copy"
                  onClick={() => handleAddCopy(book.book_id, book.title)}
                >
                  Add Copy
                </button>
                <button
                  className="delete"
                  onClick={() => handleDelete(book.book_id)}
                >
                  Delete Copy
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* PAGINATION */}
      <div className="pagination">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={currentPage === i + 1 ? "active" : ""}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

/////////////////////////////
// Export AdminExistingBooks
/////////////////////////////
export default AdminExistingBooks;
