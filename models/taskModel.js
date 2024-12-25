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
      ref: "UserModel",
      required: true,
    },
  ],
  tags: [{ type: String }],
  //tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],

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

// Method to calculate the status based on timeToComplete
taskSchema.methods.calculateStatus = function () {
  const currentDate = new Date();
  const createdAt = new Date(this.createdAt);
  const daysElapsed = Math.floor(
    (currentDate - createdAt) / (1000 * 60 * 60 * 24)
  );

  if (daysElapsed < this.timeToComplete) {
    return "In Progress";
  } else if (daysElapsed === this.timeToComplete) {
    return "Blocked";
  } else if (daysElapsed > this.timeToComplete) {
    return "Completed";
  }
  return this.status; // Default if no conditions match
};

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
