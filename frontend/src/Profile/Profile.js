// src/components/Profile/Profile.js

import React, { useEffect, useState } from "react";
import DebtBox from "./DebtBox";
import BorrowedBooks from "./BorrowedBooks";
import ReservedBooks from "./ReservedBooks";
import "./Profile.css";

const Profile = () => {
  const [amountOwed, setAmountOwed] = useState(0);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [reservedBooks, setReservedBooks] = useState([]);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    await fetchDebt();
    await fetchBorrowed();
    await fetchReserved();
  };

  const fetchDebt = async () => {
    setAmountOwed(0); 
  };

  const fetchBorrowed = async () => {
    const stored = localStorage.getItem("borrowedBooks");
    if (stored) {
      setBorrowedBooks(JSON.parse(stored));
    } else {
      setBorrowedBooks([]);
    }
  };

  const fetchReserved = async () => {
    const stored = localStorage.getItem("requestedBooks");
    if (stored) {
      setReservedBooks(JSON.parse(stored));
    }
  };

  // --- NEW FUNCTION: CLEAR DATA ---
  const handleClearData = () => {
    // Clear from Local Storage
    localStorage.removeItem("borrowedBooks");
    localStorage.removeItem("requestedBooks");
  
    // Update state (instantly updates UI)
    setBorrowedBooks([]);
    setReservedBooks([]);
  
    alert("All borrowed and requested history has been cleared.");
  };

  return (
    <div className="profile-wrapper">
      <h2 className="profile-title">My BookShelf</h2>

      <button className="back-button" onClick={() => window.history.back()}>
       Back
      </button>

      {/* NEW: RESET BUTTON (Top Right of Profile) */}
      <button 
        onClick={handleClearData}
        style={{
          position: "absolute",
          top: "50px",
          right: "50px",
          padding: "15px 25px",
          backgroundColor: "#d9534f", // Red color
          color: "white",
          border: "none",
          borderRadius: "8px",
          fontWeight: "bold",
          fontSize: "18px",
          cursor: "pointer",
          boxShadow: "0 4px 6px rgba(0,0,0,0.2)"
        }}
      >
        Clear History
      </button>
      
      <div className="profile-sections">
        <DebtBox amountOwed={amountOwed} />
        <BorrowedBooks books={borrowedBooks} />
        <ReservedBooks reserved={reservedBooks} />
      </div>
    </div>
  );
};

export default Profile;







