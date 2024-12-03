require(`dotenv`).config();
const TeamRouter = require(`express`).Router();

const { ValidUserAuthentication } = require("../utils/ValidUserAuthentication");
const { teamModel } = require("../models/teamModel");

TeamRouter.post("/", ValidUserAuthentication, async (req, res) => {
  const data = req.body;
  try {
    const newTeam = new teamModel(data);
    const newTeamSaved = await newTeam.save();
    if (newTeamSaved) {
      return res
        .status(201)
        .json({ message: "Team has been successfully created", newTeamSaved });
    } else {
      return res.status(400).json({ message: `Failed to create team` });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TeamRouter.get("/", ValidUserAuthentication, async (req, res) => {
  try {
    const teams = await teamModel.find();
    if (teams.length > 0) {
      return res.status(200).json({ message: "List of teams fetched", teams });
    } else {
      return res.status(400).json({ message: "Failed to fetch team" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { TeamRouter };
