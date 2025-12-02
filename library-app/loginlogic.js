const express = require("express");
const router = express.Router();
const { connect } = require("./db");

// TODO: When admin is complete, reroute the admin to admin page? Idfk.

router.post("/login", async(req, res) => {
    const {email,password} = req.body; // log in with email and pass only.

    if (!email || !password){
        return res.status(400).json({message: "Email and password needed"});
    }

    try {
        const conn = await connect();
        
        const [rows] = await conn.query(
            "SELECT * FROM members WHERE email = ?",
            [email]
        );
        
        if (rows.length ===0){ return res.status(404).json({message: "Email not found."});}

        const user = rows[0];

        if (user.password !== password){return res.status(401).json({message: "Incorrect Password."});}

        // Login Successful
        res.json({
            message: "Login Successful",
            user: {
                id: user.member_id,
                name: user.name,
                email: user.email,
                is_admin: user.is_admin
            }
        });
    } catch (error) {
        console.error(error)
        res.status(500).json({message: "Server Error Seniorita"})
    }
});

module.exports = router;