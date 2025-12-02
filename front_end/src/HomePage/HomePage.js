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
            <button>Logout</button> {/* Changed login to logout for logic.*/} 
          </Link>   {/*  There was a sign-up here that got removed since it logically does not make sense.*/}
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
