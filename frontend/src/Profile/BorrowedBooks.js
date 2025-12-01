const BorrowedBooks = ({ books }) => {
  return (
    <div className="borrowed-box">
      <h2>Borrowed Books</h2>

      {books.length === 0 ? (
        <p>No borrowed books.</p>
      ) : (
        <ul>
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
