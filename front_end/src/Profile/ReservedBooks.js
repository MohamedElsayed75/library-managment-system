// Maybe change this?

const ReservedBooks = ({ reserved }) => {
  return (
    <div className="reserved-box">
      <h2>Reserved Books</h2>

      {reserved.length === 0 ? (
        <p>No Requested books.</p>
      ) : (
        <ul>
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
