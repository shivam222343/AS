const cron = require("node-cron");
const sendEmail = require("../config/emailService");
const express = require("express");
const router = express.Router();
const Meeting = require("../models/Meeting");
const User = require("../models/User");
const authMiddleware = require("../middlewares/authMiddleware");

// Admin Marks Attendance
router.post("/mark-attendance", authMiddleware, async (req, res) => {
  const { meetingId, userId, status } = req.body; // Admin provides userId and status (Present/Absent)

  try {
    // Check if user is an admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied. Only Admin Can Mark Attendance" });
    }

    const meeting = await Meeting.findById(meetingId);
    if (!meeting) return res.status(404).json({ message: "Meeting Not Found" });

    // Check if the user is in the club
    const user = await User.findById(userId);
    if (!user || user.club !== meeting.club) {
      return res.status(400).json({ message: "User Not in the Same Club" });
    }

    // Check if attendance is already marked
    const attendanceIndex = meeting.attendance.findIndex(att => att.user.toString() === userId);
    let previousStatus = null;

    if (attendanceIndex !== -1) {
      previousStatus = meeting.attendance[attendanceIndex].status;
      
      // If previously marked "Absent" and admin tries to mark "Absent" again, prevent it
      if (previousStatus === "Absent" && status === "Absent") {
        return res.status(400).json({ message: "User is already marked Absent for this meeting" });
      }
      
      // Update existing record
      meeting.attendance[attendanceIndex].status = status;
    } else {
      // Add new attendance record
      meeting.attendance.push({ user: userId, status });
    }

    await meeting.save();

    // Adjust missedMeetings count only when changing attendance
    if (previousStatus === "Present" && status === "Absent") {
      user.missedMeetings += 1; // Increase only if it changed to Absent
    } else if (status === "Present") {
      user.missedMeetings = 0; // Reset missed meetings if marked as Present
    }

    await user.save();

    res.json({ message: `Attendance Marked as ${status}` });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// Daily Check at Midnight for Missed Meetings
cron.schedule("24 1 * * *", async () => {
  console.log("Running Attendance Check at 1:20 AM...");

  const users = await User.find();
  users.forEach(async (user) => {
    if (user.missedMeetings >= 3) {
      await sendEmail(
        user.email,
        "Attendance Warning!",
        `You have missed 3 consecutive meetings for ${user.club}. Please attend the next meeting!`
      );
      console.log(`Warning email sent to ${user.email}`);
    }
  });
});



// User Can View Their Attendance
router.get("/my-attendance", authMiddleware, async (req, res) => {
  const userId = req.user.id;

  try {
    const meetingsAttended = await Meeting.find({ "attendance.user": userId })
      .select("date topic attendance");

    const formattedAttendance = meetingsAttended.map(meeting => {
      const attendanceRecord = meeting.attendance.find(att => att.user.toString() === userId);
      return {
        date: meeting.date,
        topic: meeting.topic,
        status: attendanceRecord ? attendanceRecord.status : "Not Marked"
      };
    });

    res.json(formattedAttendance);

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
