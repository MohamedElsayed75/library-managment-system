/**
 * ReservedBooks Component
 * -----------------------
 * Displays a list of books that the user has reserved/requested.
 * If there are no reserved books, shows a message.
 *
 * Props:
 * - reserved: Array of reserved book objects, each containing:
 *     - title: string
 *     - status: string (e.g., "pending", "available")
 */
const ReservedBooks = ({ reserved }) => {
  return (
    <div className="reserved-box">
      <h2>Reserved Books</h2>

      {/* Show message if no reserved books */}
      {reserved.length === 0 ? (
        <p>No Requested books.</p>
      ) : (
        <ul>
          {/* Render each reserved book */}
          {reserved.map((r, index) => (
            <li key={index}>
              <strong>{r.title}</strong> — {r.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ReservedBooks;
