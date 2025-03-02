const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const authMiddleware = require("../middlewares/authMiddleware");
const adminMiddleware = require("../middlewares/adminMiddleware");
const Key = require("../models/Key");

router.post("/create-meeting", authMiddleware, adminMiddleware, async (req, res) => {
  const { club, date, topic, location } = req.body;

  try {
    const newMeeting = new Meeting({ club, date, topic,location, attendees: [] });
    await newMeeting.save();
    res.status(201).json({ message: "Meeting Created!" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});



router.post("/generate-key", async (req, res) => {
  const { club, key } = req.body;

  try {
    const newKey = new Key({ club, key });
    await newKey.save();
    res.status(201).json({ message: "Key Created!" });
  } catch (error) {
    res.status(500).json({ message: "Enter a valid key (don't use duplicate)" });
  }
});


module.exports = router;

