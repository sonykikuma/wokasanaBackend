require("dotenv").config();
const TaskRouter = require("express").Router();
const mongoose = require("mongoose");

const { ValidUserAuthentication } = require("../utils/ValidUserAuthentication");
const { taskModel } = require("../models/taskModel");

TaskRouter.get("/", ValidUserAuthentication, async (req, res) => {
  const { team, owner, tags, project, status } = req.query;
  // mongoDB behavior : if any one among them happens to be undefined , mongoose will not use it for filtering
  try {
    const tasks = await taskModel.find({ team, owner, tags, project, status });
    if (tasks.length > 0) {
      return res.status(200).json({ message: "fetched Successfully", tasks });
    } else {
      return res.status(400).json({ message: "empty", tasks });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.post("/", ValidUserAuthentication, async (req, res) => {
  const data = req.body;
  try {
    const newtask = new taskModel(data);
    const newTaskSaved = await newtask.save();
    if (newTaskSaved) {
      console.log(newTaskSaved);
      return res
        .status(201)
        .json({ message: "New task Created", newTaskSaved });
    } else {
      return res.status(400).json({ message: "Failed to create new" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.post("/:id", ValidUserAuthentication, async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const task = await taskModel.findByIdAndUpdate(
      id,
      { $set: { ...body } },
      { new: true }
    );

    if (task) {
      return res.status(200).json({ message: "task has been updated", task });
    } else {
      return res.status(400).json({ message: "failed to update task", task });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.delete("/:id", ValidUserAuthentication, async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const deletedTask = await taskModel.findByIdAndDelete(id);
    if (deletedTask) {
      return res
        .status(200)
        .json({ message: `Successfully deleted`, deletedTask });
    } else {
      return res
        .status(400)
        .json({ message: `Failed To delete task`, deletedTask });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.get("/:id", ValidUserAuthentication, async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const data = await taskModel
      .findById(id)
      .populate({ path: "owners", select: "name _id" })
      .populate({ path: "project", select: "name _id" })
      .populate({ path: "team", select: "name _id" });
    console.log(data);
    if (data) {
      return res.status(200).json({ message: `Successfully fetched`, data });
    } else {
      return res.status(400).json({ message: `Failed To fetch task`, data });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.get("/me/:userId", ValidUserAuthentication, async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await taskModel.find({ owners: { $in: [userId] } });
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.get("/project/:Pid", ValidUserAuthentication, async (req, res) => {
  const { Pid } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(Pid)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    var data = await taskModel
      .find({ project: new mongoose.Types.ObjectId(Pid) })
      .populate({ path: "owners", select: "name _id" })
      .lean();

    console.log(data);
    if (data) {
      data = data.map((ele) => {
        // in milliseconds
        const FinishDate =
          Date.now(ele.createdAt) + ele.timeToComplete * 24 * 60 * 60 * 1000;
        const todaysDate = Date.now();
        const milliSecondsIn1Day = 24 * 60 * 60 * 1000;
        const Due = Math.abs((FinishDate - todaysDate) / milliSecondsIn1Day);
        ele[`Due`] = Due;
        return ele;
      });
      return res.status(200).json({ message: `Successfully fetched`, data });
    } else {
      return res.status(400).json({ message: `Failed To fetch task`, data });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { TaskRouter };
