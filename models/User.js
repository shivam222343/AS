const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  club: String, // Club Name (assigned based on key)
  role: { type: String, enum: ["user", "admin"], default: "user" },
  missedMeetings: { type: Number, default: 0 }, // Track absences
});

module.exports = mongoose.model("User", UserSchema);
