import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Books from "../Books/Books";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
    const [member, setMember] = useState(null); // { member_id, is_admin, name}

  // ------------------- AUTHENTICATION CHECK -------------------
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/"); // No token → redirect to login
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch("http://localhost:5000/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          localStorage.removeItem("token");
          navigate("/"); // Invalid or expired token
          return;
        }

        const data = await res.json(); 
      
        setMember(data.member); // <-- grab the member object
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    }

    verifyToken();
  }, [navigate]);

  // ------------------- LOGOUT HANDLER -------------------
  function handleLogout() {
    localStorage.removeItem("token"); // remove JWT
    navigate("/");
  }

  return (
    <div className="homepage-wrapper">
      {/* ------------------- HEADER SECTION ------------------- */}
      <header className="homepage-header">
        {/* Left-side buttons */}
        <div className="left-buttons">
          <Link to="/profile">
            <button>Profile</button>
          </Link>

          {/* Show Admin Panel button if member is admin */}
          {member?.is_admin && (
            <Link to="/admin">
              <button>Admin Panel</button>
            </Link>
          )}
        </div>

        {/* Right-side buttons */}
        <div className="right-buttons">
          <span>{member?.name && `Welcome, ${member.name}`}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* ------------------- MAIN BOOKS SECTION ------------------- */}
      <main className="homepage-main">
        <Books />
      </main>
    </div>
  );
};

export default HomePage;
