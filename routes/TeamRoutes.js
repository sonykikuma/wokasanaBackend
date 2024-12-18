require(`dotenv`).config();
const TeamRouter = require(`express`).Router();

const { ensureAuthentication } = require("../utils/ValidUserAuthentication");
const { teamModel } = require("../models/teamModel");

TeamRouter.post("/", ensureAuthentication, async (req, res) => {
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

TeamRouter.get("/", ensureAuthentication, async (req, res) => {
  try {
    const teams = await teamModel.find();
    return res
      .status(200)
      .json({ message: "List of teams fetched", teams: teams || [] });
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { TeamRouter };
