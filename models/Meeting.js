const mongoose = require("mongoose");

const MeetingSchema = new mongoose.Schema({
  club: { type: String, required: true }, // Club Name
  date: { type: Date, required: true },
  topic: { type: String, required: true },
  location: { type: String, required: true},
  attendance: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: { type: String, enum: ["Present", "Absent", "Not Marked"], default: "Not Marked" }
    }
  ]
});

module.exports = mongoose.model("Meeting", MeetingSchema);
