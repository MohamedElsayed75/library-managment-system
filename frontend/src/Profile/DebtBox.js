const DebtBox = ({ amountOwed }) => {
  return (
    <div className="debt-box">
      <h2>Amount Owed</h2>
      <p className="debt-amount">${amountOwed}</p>
    </div>
  );
};

export default DebtBox;
