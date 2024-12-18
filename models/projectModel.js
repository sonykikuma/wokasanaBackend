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
// 67601bae1f428d850c9f3114
