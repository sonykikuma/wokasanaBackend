const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
  },
  { timestamps: true }
);

const projectModel = mongoose.model("Project", projectSchema);

module.exports = { projectModel };
