const mongoose = require("mongoose");

const KeySchema = new mongoose.Schema({
  club: String, // Club name
  key: { type: String, unique: true }, // Unique Key for Signup
});

module.exports = mongoose.model("Key", KeySchema);

