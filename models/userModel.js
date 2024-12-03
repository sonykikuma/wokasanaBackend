const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    oauth: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);

module.exports = { userModel };
