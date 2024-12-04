require(`dotenv`).config();
const TagRouter = require(`express`).Router();
const { CookieMiddleware } = require("../utils/CookieMiddlware");
const { ValidUserAuthentication } = require("../utils/ValidUserAuthentication");
const { tagModel } = require("../models/tagModel");

TagRouter.post("/", async (req, res) => {
  const data = req.body;
  try {
    const newTag = new tagModel(data);
    const newSavedTag = await newTag.save();
    if (newSavedTag) {
      return res
        .status(200)
        .json({ message: "Successfully created new Tag", newSavedTag });
    } else {
      return res.status(400).json({ message: "Failed to create Tag" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

TagRouter.get("/", ValidUserAuthentication, async (req, res) => {
  const data = req.body;
  try {
    const allTags = await tagModel.find();
    // if (allTags.length > 0) {
    return res.status(200).json({ message: "List of All Tags", allTags });
    // } else {
    //   return res.status(400).json({ message: "Tag List is empty" });
    // }
  } catch (err) {
    return res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { TagRouter };
