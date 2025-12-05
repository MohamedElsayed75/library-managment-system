import React from "react";

const BorrowedBooks = ({ borrowedBooks, memberId, refresh }) => {

  const handleReturn = async (transactionId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/user/return?transactionId=${transactionId}`,
        { method: "POST" }
      );

      const data = await res.json();
      alert(data.message);

      // Reload borrowed books after returning
      refresh();

    } catch (err) {
      console.error("Return failed:", err);
    }
  };

  return (
    <div className="borrowed-box">
      <h2>Borrowed Books</h2>

      {borrowedBooks.length === 0 ? (
        <p>No borrowed books.</p>
      ) : (
        <ul>
          {borrowedBooks.map((b) => (
            <li key={b.transaction_id}>
              <strong>{b.book_title}</strong> — {b.days_remaining} day{b.days_remaining !== 1 ? "s" : ""} remaining

              <button
                className="return-btn"
                onClick={() => handleReturn(b.transaction_id)}
              >
                Return
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowedBooks;
