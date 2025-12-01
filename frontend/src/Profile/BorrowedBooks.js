/**
 * BorrowedBooks Component
 * -----------------------
 * Displays a list of borrowed books passed in via props.
 * If there are no borrowed books, shows a message.
 *
 * Props:
 * - books: Array of book objects, each containing:
 *     - title: string
 *     - daysRemaining: number (days left to return the book)
 */
const BorrowedBooks = ({ books }) => {
  return (
    <div className="borrowed-box">
      <h2>Borrowed Books</h2>

      {/* Check if there are any borrowed books */}
      {books.length === 0 ? (
        <p>No borrowed books.</p>
      ) : (
        <ul>
          {/* Render each borrowed book with its remaining days */}
          {books.map((b, index) => (
            <li key={index}>
              <strong>{b.title}</strong> — {b.daysRemaining} days remaining
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BorrowedBooks;
