const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Key = require("../models/Key");
const router = express.Router();

router.post("/signup", async (req, res) => {
  const { name, email, password, key } = req.body;

  try {
    // Validate key and get club info
    const keyData = await Key.findOne({ key });
    if (!keyData) return res.status(400).json({ message: "Invalid Key" });

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Email Already Registered" });

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      club: keyData.club, // Assign user to a club based on key
      role: "user",
      missedMeetings: 0, // Initialize missed meetings
    });

    await newUser.save();
    res.status(201).json({ message: "Signup Successful!" });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});



router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User Not Found" });

    // Compare Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid Credentials" });

    // Get Secret Key from .env
    const secretKey = process.env.JWT_SECRET;
    if (!secretKey) return res.status(500).json({ message: "JWT Secret Key Not Found" });

    // Generate Token using Secret Key from .env
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      secretKey, 
      { expiresIn: "1d" }
    );

    res.json({ token, role: user.role });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});
  
  module.exports = router;
  