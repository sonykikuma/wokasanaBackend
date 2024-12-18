require(`dotenv`).config();
const ReportRouter = require(`express`).Router();

const { ensureAuthentication } = require("../utils/ValidUserAuthentication");
const Task = require("../models/taskModel");

ReportRouter.get("/last-week", ensureAuthentication, async (req, res) => {
  const { userId } = req.user;
  try {
    const tasksCompleted = await Task.find({
      owners: { $in: [userId] },
      status: "Completed",
    }).lean();
    const taskCompletedLastWeek = tasksCompleted?.filter((task) => {
      if (
        new Date(task.updatedAt) >=
        new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) {
        return true;
      }
      return false;
    });
    if (taskCompletedLastWeek.length > 0) {
      return res.status(200).json({
        taskCompletedLastWeek,
        message: "List of Task COMpleted Last week",
      });
    } else {
      return res.status(400).json({
        taskCompletedLastWeek: [],
        message: "No Task completed Last week",
      });
    }
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
});

ReportRouter.get("/pending", ensureAuthentication, async (req, res) => {
  const { userId } = req.user;
  try {
    const tasks = await Task.find({
      owners: { $in: [userId] },
      status: { $nin: ["Completed"] },
    });
    const totalDaysOfWorkPending = tasks.reduce(
      (acc, ele) => acc + (ele.timeToComplete || 0),
      0
    );
    // console.log(totalDaysOfWorkPending);
    return res
      .status(200)
      .json({ totalDaysOfWorkPending, message: "total Days of work pending" });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
});

ReportRouter.get("/closed-tasks", ensureAuthentication, async (req, res) => {
  const { groupByCategory, value } = req.query;

  try {
    var taskslength = await Task.find({
      [groupByCategory]: value,
    }).lean();

    // console.log(taskslength);

    var tasksClength = await taskModel
      .find({
        [groupByCategory]: value,
        status: "Completed",
      })
      .lean();

    // console.log(tasksClength);
    console.log({
      groupByCategory: groupByCategory,
      value: value,
      totalTasks: taskslength.length,
      totalCompletedTasks: tasksClength.length,
    });
    return res.status(200).json({
      groupByCategory: groupByCategory,
      totalTasks: taskslength.length,
      totalCompletedTasks: tasksClength.length,
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
});

module.exports = { ReportRouter };
