const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
  },
  { timestamps: true }
);

const userModel = mongoose.model("UserModel", userSchema);

module.exports = { userModel };
