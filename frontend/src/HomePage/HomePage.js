import React from "react";
import { Link } from "react-router-dom";
import Books from "../Books/Books";
import "./HomePage.css";

/**
 * HomePage Component
 * ------------------
 * Renders the main homepage of the library management system.
 * Contains navigation buttons and the books section.
 */
const HomePage = () => {
  return (
    <div className="homepage-wrapper">

      {/* ------------------- HEADER SECTION ------------------- */}
      {/* Top buttons for navigation: Profile, Login, Register */}
      <header className="homepage-header">
        <div className="left-buttons">
          {/* Link to user profile page */}
          <Link to="/profile">
            <button>Profile</button>
          </Link>
        </div>
        <div className="right-buttons">
          {/* Link to login page */}
          <Link to="/">
            <button>Login</button>
          </Link>
          {/* Link to registration page */}
          <Link to="/register">
            <button>Register</button>
          </Link>
        </div>
      </header>

      {/* ------------------- MAIN BOOKS SECTION ------------------- */}
      {/* Display list of books from Books component */}
      <main className="homepage-main">
        <Books />
      </main>

    </div>
  );
};

export default HomePage;