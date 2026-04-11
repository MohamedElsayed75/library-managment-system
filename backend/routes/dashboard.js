const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth.js");

/////////////////////////////
// GET Current Member Info
/////////////////////////////
router.get("/", authenticateToken, async (req, res) => {
    try {
        const member = {
            member_id: req.user.member_id,
            is_admin: req.user.is_admin,
            name: req.user.name
        };

        res.json({ member });
    } catch (error) {
        console.error(error);
        res.status(500).json({ errorMessage: "Error retrieving member info" });
    }
});

/////////////////////////////
// Export Router
/////////////////////////////
module.exports = router;
