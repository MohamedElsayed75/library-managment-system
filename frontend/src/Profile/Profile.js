// src/components/Profile/Profile.js

import React, { useEffect, useState } from "react";
import DebtBox from "./DebtBox";
import BorrowedBooks from "./BorrowedBooks";
import ReservedBooks from "./ReservedBooks";
import "./Profile.css";

/**
 * Profile Component
 * -----------------
 * Displays the user's profile page with:
 * - Debt information
 * - Borrowed books
 * - Reserved books
 * 
 * Data is loaded from localStorage and managed via React state.
 */
const Profile = () => {
  const [amountOwed, setAmountOwed] = useState(0);           // Total debt amount
  const [borrowedBooks, setBorrowedBooks] = useState([]);    // List of borrowed books
  const [reservedBooks, setReservedBooks] = useState([]);    // List of reserved books

  // Load profile data on component mount
  useEffect(() => {
    loadProfileData();
  }, []);

  /**
   * Load all profile data
   */
  const loadProfileData = async () => {
    await fetchDebt();
    await fetchBorrowed();
    await fetchReserved();
  };

  /**
   * Fetch debt information
   * Currently sets to 0 (placeholder)
   */
  const fetchDebt = async () => {
    setAmountOwed(0); 
  };

  /**
   * Fetch borrowed books from localStorage
   */
  const fetchBorrowed = async () => {
    const stored = localStorage.getItem("borrowedBooks");
    if (stored) {
      setBorrowedBooks(JSON.parse(stored));
    } else {
      setBorrowedBooks([]);
    }
  };

  /**
   * Fetch reserved books from localStorage
   */
  const fetchReserved = async () => {
    const stored = localStorage.getItem("requestedBooks");
    if (stored) {
      setReservedBooks(JSON.parse(stored));
    }
  };

  /**
   * Clear all borrowed and reserved book data
   * Updates localStorage and UI state
   */
  const handleClearData = () => {
    localStorage.removeItem("borrowedBooks");
    localStorage.removeItem("requestedBooks");
    setBorrowedBooks([]);
    setReservedBooks([]);
    alert("All borrowed and requested history has been cleared.");
  };

  return (
    <div className="profile-wrapper">
      <h2 className="profile-title">My BookShelf</h2>

      {/* Back button */}
      <button className="back-button" onClick={() => window.history.back()}>
        Back
      </button>

      {/* Clear History button (top right) */}
      <button 
        onClick={handleClearData}
        style={{
          position: "absolute",
          top: "50px",
          right: "50px",
          padding: "15px 25px",
          backgroundColor: "#d9534f",
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
      
      {/* Profile sections */}
      <div className="profile-sections">
        <DebtBox amountOwed={amountOwed} />
        <BorrowedBooks books={borrowedBooks} />
        <ReservedBooks reserved={reservedBooks} />
      </div>
    </div>
  );
};

export default Profile;