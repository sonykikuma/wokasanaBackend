require(`dotenv`).config();
const ProjectRouter = require(`express`).Router();
const { ValidUserAuthentication } = require("../utils/ValidUserAuthentication");
const { projectModel } = require("../models/projectModel");

ProjectRouter.post("/", ValidUserAuthentication, async (req, res) => {
  const data = req.body;
  try {
    const newProject = new projectModel(data);
    const newProjectSaved = await newProject.save();
    if (newProjectSaved) {
      return res
        .status(201)
        .json({ message: "new Project Created", newProjectSaved });
    } else {
      return res.status(400).json({ message: "failed to create new Project" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

ProjectRouter.get("/", ValidUserAuthentication, async (req, res) => {
  try {
    const allProjects = await projectModel.find();
    if (allProjects.length > 0) {
      return res
        .status(200)
        .json({ message: "All Projects Fetched", allProjects });
    } else {
      return res.status(400).json({ message: "No Projects to Fetch" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { ProjectRouter };