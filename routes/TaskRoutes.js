require("dotenv").config();
const TaskRouter = require("express").Router();
const mongoose = require("mongoose");

const { ensureAuthentication } = require("../utils/ValidUserAuthentication");
const Task = require("../models/taskModel");

TaskRouter.get("/", ensureAuthentication, async (req, res) => {
  const { team, owners, tags, project, status } = req.query;
  console.log("Query Parameters:", req.query);

  try {
    // Convert string IDs to ObjectIds if they are provided
    const query = {};
    if (team) query.team = mongoose.Types.ObjectId(team);
    if (owners)
      query.owners = {
        $in: owners.split(",").map((owner) => mongoose.Types.ObjectId(owner)),
      };
    if (tags) query.tags = { $in: tags.split(",") };
    if (project) query.project = mongoose.Types.ObjectId(project);
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .populate("team")
      .populate("project")
      .populate("owners")
      .exec();
    //to get updated status of task
    const tasksWithStatus = tasks.map((task) => {
      const taskObject = task.toObject(); // Convert Mongoose document to plain object
      taskObject.calculatedStatus = task.calculateStatus();
      return taskObject;
    });

    // Respond with tasks
    if (tasksWithStatus.length > 0) {
      return res
        .status(200)
        .json({ message: "Fetched Successfully", tasks: tasksWithStatus });
    } else {
      return res.status(404).json({ message: "No tasks found" });
    }

    // if (tasks.length > 0) {
    //   return res.status(200).json({ message: "Fetched Successfully", tasks });
    // } else {
    //   return res.status(400).json({ message: "No tasks found", tasks });
    // }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.post("/", ensureAuthentication, async (req, res) => {
  const data = req.body;
  try {
    const newtask = new Task(data);
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

TaskRouter.post("/:id", ensureAuthentication, async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const task = await Task.findByIdAndUpdate(
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

TaskRouter.delete("/:id", ensureAuthentication, async (req, res) => {
  const { id } = req.params;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const deletedTask = await Task.findByIdAndDelete(id);
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

TaskRouter.get("/:id", ensureAuthentication, async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    const data = await Task.findById(id)
      .populate({ path: "owners", select: "name _id" })
      .populate({ path: "project", select: "name _id" })
      .populate({ path: "team", select: "name _id" });
    console.log(data);

    if (!data) {
      return res.status(400).json({ message: `No such task found`, data });
    }
    //fetching updated status
    const updatedStatus = data.calculateStatus();

    // Convert to plain object and add the calculated status
    const taskWithStatus = {
      ...data.toObject(),
      calculatedStatus: updatedStatus,
    };

    // Respond with the task
    return res
      .status(200)
      .json({ message: "Successfully fetched", data: taskWithStatus });

    // else {
    //   return res.status(200).json({ message: `Successfully fetched`, data });

    // }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.get("/me/:userId", ensureAuthentication, async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await Task.find({ owners: { $in: [userId] } });
    return res.status(200).json({ tasks });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TaskRouter.get("/project/:Pid", ensureAuthentication, async (req, res) => {
  const { Pid } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(Pid)) {
      return res.status(400).json({ message: "Invalid ID" });
    }
    var data = await Task.find({ project: new mongoose.Types.ObjectId(Pid) })
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
// mongoDB behavior : if any one among them happens to be undefined , it will return empty array
// {
//   "name": "Mobile  Web Development",
//   "project": "67601bae1f428d850c9f3114",
//   "team": "6760194d1f428d850c9f3111",
//   "owners": ["676012551f428d850c9f310d"],
//   "tags": ["UI", "Design"],
//   "status": "To Do",
//     "timeToComplete": 7

// }
