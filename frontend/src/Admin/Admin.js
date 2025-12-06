import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "../services/api";
import AdminExistingBooks from "./AdminExistingBooks";
import AdminAddBook from "./AdminAddBook";
import "./Admin.css";

/////////////////////////////
// Admin Component
/////////////////////////////
const Admin = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);

  /////////////////////////////
  // Authentication Check
  /////////////////////////////
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    async function verifyToken() {
      try {
        const data = await verifyTokenRequest(token);
        if (!data.member.is_admin) navigate("/");
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
  // JSX
  /////////////////////////////
  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate("/")}>
        Back
      </button>

      <h2 className="admin-title">Admin Panel</h2>

      {/* Add Book Section */}
      <AdminAddBook member={member} />

      {/* Existing Books Section */}
      <AdminExistingBooks member={member} />
    </div>
  );
};

/////////////////////////////
// Export Admin
/////////////////////////////
export default Admin;
