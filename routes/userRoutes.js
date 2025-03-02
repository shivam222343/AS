const express = require("express");
const router = express.Router();
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

// Get List of All Users (Admin Only)
router.get("/list", authMiddleware, async (req, res) => {
  try {
    // Check if the user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins Only" });
    }

    // Fetch all users
    const users = await User.find().select("name email club missedMeetings");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
