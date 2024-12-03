const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Team",
    required: true,
  },
  owners: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  tags: [{ type: String }],
  timeToComplete: { type: Number, required: true },
  status: {
    type: String,
    enum: ["To Do", "In Progress", "Completed", "Blocked"],
    default: "To Do",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

taskSchema.pre("findOneAndUpdate", function (next) {
  this.updatedAt = Date.now();
  next();
});

taskSchema.pre("findByIdAndUpdate", function (next) {
  this.updatedAt = Date.now();
  next();
});

const taskModel = mongoose.model("Task", taskSchema);

module.exports = { taskModel };
