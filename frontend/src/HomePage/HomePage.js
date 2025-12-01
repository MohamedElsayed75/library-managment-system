import React from "react";
import { Link } from "react-router-dom";
import Books from "../Books/Books";
import "./HomePage.css";

const HomePage = () => {
  return (
    <div className="homepage-wrapper">

      {/* TOP BUTTONS */}
      <header className="homepage-header">
        <div className="left-buttons">
          <Link to="/profile">
            <button>Profile</button>
          </Link>
        </div>
        <div className="right-buttons">
          <Link to="/">
            <button>Login</button>
          </Link>
          <Link to="/signup">
            <button>Sign Up</button>
          </Link>
        </div>
      </header>

      {/* BOOKS SECTION */}
      <main className="homepage-main">
        <Books />
      </main>

    </div>
  );
};

export default HomePage;
