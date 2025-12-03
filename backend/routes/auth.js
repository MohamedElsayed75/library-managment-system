const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');

const {
    getMemberByEmail,
    registerMember,
    logAction
} = require('../database/database.js');

// -------------------------------------------------
// REGISTER
// -------------------------------------------------
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, address } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ errorMessage: "Name, email, and password are required" });
        }

        // Check if email already exists
        const exists = await getMemberByEmail(email);
        if (exists) {
            return res.status(400).json({ errorMessage: "Email already registered" });
        }

        // Store user exactly as provided
        const newId = await registerMember(name, email, password, address);


        res.json({
            success: true,
            message: "Registration successful",
            member_id: newId
        });

    } catch (err) {
        console.error("REGISTER ERROR:", err);
        res.status(500).json({ errorMessage: "Server error" });
    }
});

// -------------------------------------------------
// LOGIN
// -------------------------------------------------
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ errorMessage: "Email and password are required" });
        }

        const member = await getMemberByEmail(email);

        if (!member || member.password !== password) {
            return res.status(400).json({ errorMessage: "Invalid email or password" });
        }

        await logAction(member.member_id, "User logged in");

        // JWT AUTH
        const SECRET = 'my_super_secret_1234567890'; 
        const token = jwt.sign({ member_id: member.member_id, is_admin: member.is_admin, name: member.name }, SECRET)


        res.json({
            success: true,
            message: "Login successful",
            member: {
                member_id: member.member_id,
                name: member.name,
                email: member.email,
                is_admin: member.is_admin
            },
            token: token
        });



    } catch (err) {
        console.error("LOGIN ERROR:", err);
        res.status(500).json({ errorMessage: "Server error" });
    }
});


module.exports = router;