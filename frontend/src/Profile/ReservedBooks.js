const ReservedBooks = ({ reserved, memberId, refresh }) => {

  const handleCancel = async (reserveId) => {
    try {
      const res = await fetch(`/api/members/${memberId}/reserved/${reserveId}/cancel`, {
        method: "POST",
      });

      const data = await res.json();
      alert(data.message);
      refresh(); // reload reserved books
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  return (
    <div className="reserved-box">
      <h2>Reserved Books</h2>

      {reserved.length === 0 ? (
        <p>No reserved books.</p>
      ) : (
        <ul>
          {reserved.map((r) => (
            <li key={r.reserve_id}>
              <strong>{r.title}</strong> — {r.status}

              <button
                className="cancel-btn"
                onClick={() => handleCancel(r.reserve_id)}
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

export default ReservedBooks;
