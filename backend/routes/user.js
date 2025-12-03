const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth.js");

// let this user be for borrowing and returning books and reserving books
router.get("/borrow", authenticateToken, async (req, res) => {
    try {
        const member = {
            member_id: req.user.member_id,
            is_admin: req.user.is_admin,
            name: req.user.name
        };
        res.json({ member });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Error retrieving books" });
    }
});
module.exports = router;