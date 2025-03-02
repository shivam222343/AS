const mongoose = require("mongoose");

const clubSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  keys: [{ type: String, unique: true }], // Predefined keys
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
});

module.exports = mongoose.model("Club", clubSchema);
