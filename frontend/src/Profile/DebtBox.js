import React from "react";

/////////////////////////////
// DebtBox Component
/////////////////////////////
const DebtBox = ({ amountOwed, memberId, refreshProfile }) => {
  const handlePayFines = async () => {
    try {
      const res = await fetch(`http://localhost:5000/user/payfines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId })
      });

      const data = await res.json();
      alert(data.message);

      if (refreshProfile) refreshProfile();
    } catch (err) {
      console.error("Error paying fines:", err);
    }
  };
  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="debt-box">
      <h2>Amount Owed</h2>

      <div className="debt-row">
        <p className="debt-amount">${amountOwed}</p>

        <button
          className="pay-fines-button"
          onClick={handlePayFines}
          disabled={Number(amountOwed) === 0}
        >
          Pay Fines
        </button>
      </div>
    </div>
  );
};

/////////////////////////////
// Export DebtBox
/////////////////////////////
export default DebtBox;
