// signupLogic.js
const express = require("express");
const router = express.Router();
const { connect } = require("./db");

router.post("/signup", async (req, res) => {
    const { name, email, password, address} = req.body;

    if(!name || !email || !password || !address ){
        return res.status(400).json({message: "All fields required."})
    }
    try {
        const conn = await connect();

        // Add new member to db
        await conn.query(
            "INSERT INTO members (name, email, password, address, membership_date, is_admin) VALUES (?, ?, ?, ?, CURDATE(), false)",
            [name,email,password,address]
        );

        res.json({message: "Success."});
    } catch(error){
        console.error(error);
        res.status(500).json({ message: "Server error."}) 
    }
});

module.exports = router;