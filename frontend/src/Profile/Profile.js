import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyTokenRequest } from "../services/api";
import "./Profile.css";
import DebtBox from "./DebtBox";
import BorrowedBooks from "./BorrowedBooks";
import ReservedBooks from "./ReservedBooks";

/////////////////////////////
// Profile Component
/////////////////////////////
const Profile = () => {
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
  // Profile Data State
  /////////////////////////////
  const [profileData, setProfileData] = useState({
    amountOwed: 0,
    borrowedBooks: [],
    reservedBooks: []
  });

  /////////////////////////////
  // Fetch Profile Data
  /////////////////////////////
  const fetchProfileData = async (memberId) => {
    try {
      const res = await fetch(`http://localhost:5000/user/profile?memberId=${memberId}`);
      const data = await res.json();

      setProfileData({
        amountOwed: data.amountOwed,
        borrowedBooks: data.borrowedBooks,
        reservedBooks: data.reservedBooks
      });
    } catch (err) {
      console.error("Error fetching profile data:", err);
    }
  };

  useEffect(() => {
    if (member) fetchProfileData(member.member_id);
  }, [member]);
  /////////////////////////////
  // JSX
  /////////////////////////////
  return (
    <div className="profile-wrapper">
      <h2 className="profile-title">My Bookshelf</h2>

      <button className="back-button" onClick={() => navigate("/")}>
        Back
      </button>

      <div className="profile-sections">
        <DebtBox
          amountOwed={profileData.amountOwed}
          memberId={member?.member_id}
          refreshProfile={() => fetchProfileData(member.member_id)}
        />

        <BorrowedBooks
          borrowedBooks={profileData.borrowedBooks}
          memberId={member?.member_id}
          refresh={() => fetchProfileData(member.member_id)}
        />

        <ReservedBooks
          reservedBooks={profileData.reservedBooks}
          memberId={member?.member_id}
          refresh={() => fetchProfileData(member.member_id)}
        />
      </div>
    </div>
  );
};
/////////////////////////////
// Export Profile
/////////////////////////////
export default Profile;
