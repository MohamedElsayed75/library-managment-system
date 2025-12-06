const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.js");


router.get("/", authenticateToken, async (req, res) => {
    try {
        //send user
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