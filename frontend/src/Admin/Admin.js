import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "../services/api";
import AdminExistingBooks from "./AdminExistingBooks";
import AdminAddBook from "./AdminAddBook"; // Import the new component
import "./Admin.css";

const Admin = () => {
  const navigate = useNavigate();
  const [member, setMember] = useState(null);

  // ---------------------- AUTH CHECK ----------------------
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    async function verifyToken() {
      try {
        const data = await verifyTokenRequest(token);
        if (!data.member.is_admin) {
          navigate("/");
        }
        setMember(data.member);
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.removeItem("token");
        navigate("/");
      }
    }

    verifyToken();
  }, [navigate]);
  // ---------------------- END AUTH CHECK ----------------------

  return (
    <div className="admin-container">
            <button className="back-button" onClick={() => navigate("/")}>
        Back
      </button>
      <h2 className="admin-title">
        Admin Panel
      </h2>

      {/* ADD BOOK SECTION */}
      <AdminAddBook member={member} />

      {/* EXISTING BOOKS */}
      <AdminExistingBooks member={member} />
    </div>
  );
};

export default Admin;
