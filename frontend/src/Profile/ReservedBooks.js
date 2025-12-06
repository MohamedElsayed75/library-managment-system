import React from "react";

/////////////////////////////
// ReservedBooks Component
/////////////////////////////
const ReservedBooks = ({ reservedBooks, memberId, refresh }) => {

  /////////////////////////////
  // Handle Cancel Reservation
  /////////////////////////////
  const handleCancel = async (reserve) => {
    try {
      const res = await fetch(
        `http://localhost:5000/user/cancelReservation`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ member_id: memberId, book_id: reserve.book_id }),
        }
      );

      const data = await res.json();
      alert(data.message);

      // Reload reserved books after cancellation
      refresh();

    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="reserved-box">
      <h2>Reserved Books</h2>

      {reservedBooks.length === 0 ? (
        <p>No reserved books.</p>
      ) : (
        <ul>
          {reservedBooks.map((r) => (
            <li key={r.reservation_id} className="borrowed-item">
              <div className="borrow-info">
                <strong>{r.book_title}</strong> — Reserved on {new Date(r.reservation_date).toLocaleDateString()}
              </div>

              <button
                className="cancel-btn"
                onClick={() => handleCancel(r)}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/////////////////////////////
// Export ReservedBooks
/////////////////////////////
export default ReservedBooks;
