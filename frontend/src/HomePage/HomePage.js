import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "../services/api";
import "./HomePage.css";
import Books from "../Books/Books";

/////////////////////////////
// HomePage Component
/////////////////////////////
const HomePage = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null); // { member_id, is_admin, name}

  /////////////////////////////
  // Authentication Check
  /////////////////////////////
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }

    async function verifyToken() {
      try {
        const data = await verifyTokenRequest(token);
        setMember(data.member);
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    }

    verifyToken();
  }, [navigate]);

  /////////////////////////////
  // Logout Handler
  /////////////////////////////
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="homepage-wrapper">
      {/* HEADER */}
      <header className="homepage-header">

        {/* Left-side buttons */}
        <div className="left-buttons">
          <Link to="/profile">
            <button>Profile</button>
          </Link>

          {member?.is_admin && (
            <Link to="/admin">
              <button>Admin Panel</button>
            </Link>
          )}
        </div>

        {/* Right-side buttons */}
        <div className="right-buttons">
          <span className="welcome-text">
            {member?.name ? `Welcome, ${member.name}` : ""}
          </span>

          <button onClick={handleLogout}>Logout</button>
        </div>

      </header>

      {/* MAIN BOOKS SECTION */}
      <main className="homepage-main">
        <Books member={member} />
      </main>
    </div>
  );
};

/////////////////////////////
// Export HomePage
/////////////////////////////
export default HomePage;
