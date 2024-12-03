const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
  },
  { timestamps: true }
);

const tagModel = mongoose.model("Tag", tagSchema);

module.exports = { tagModel };
