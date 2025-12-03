import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import SignUp from "./SignUp";
import Profile from "./Profile/Profile";
import HomePage from "./HomePage/HomePage";
import Admin from "./Admin/Admin";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/HomePage" element={<HomePage />} />
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/profile" element={<Profile />} />
        <Route path= "/admin" element={<Admin/>}/>
      </Routes>
    </Router>
  );
}
// LIST OF CHANGES MADE SO FAR:
// 1. HomePage.js : removed sign-up and changed login to logout.
// 2. SignUp.js : Connected to the backend fake registration removed.
// 3. Login.js : Connect to the back end fake registration removed and 
// changed entry from username to email. Admin check done.
// 4. Book.js:  Connected to the back end fake data removed.
// I have no idea how the search is broken but the category filter works.
// 5. BookCard.js: Now properly features the shit from backend.
// 6. BookDetails.js: Now properly features the shit from backend.

export default App;
