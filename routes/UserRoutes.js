require("dotenv").config();
const UserRouter = require("express").Router();

const { ensureAuthentication } = require("../utils/ValidUserAuthentication");
const bcrypt = require("bcrypt");
const { userModel } = require("../models/userModel");
const jwt = require("jsonwebtoken");

UserRouter.post("/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const hashPassword = bcrypt.hashSync(password, 5);

    const newUser = new userModel({ name, email, password: hashPassword });

    const savedNewUser = await newUser.save();
    if (savedNewUser) {
      return res
        .status(201)
        .json({ message: "user account created successfully." });
    } else {
      return res.status(404).json({ message: "user account creation failed" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

UserRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Searching for user with email:", email);

    const userFromDB = await userModel.findOne({ email });
    if (userFromDB) {
      const result = bcrypt.compareSync(password, userFromDB.password);
      if (result) {
        const token = jwt.sign(
          {
            email: userFromDB.email,
            name: userFromDB.name,
            userId: userFromDB._id,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "10h",
          }
        );
        return res.status(200).json({
          message: "login successful",
          token,
          user: {
            name: userFromDB.name,
            email: userFromDB.email,
            userId: userFromDB._id,
          },
        });
      } else {
        return res.status(400).json({ message: "Incorrect Password" });
      }
    } else {
      return res.status(400).json({ message: "email is not registered" });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

//to fetch all users
UserRouter.get("/", ensureAuthentication, async (req, res) => {
  try {
    // const users = await userModel.find({ email: { $nin: [req.user.email] } });
    const users = await userModel.find();
    return res.status(200).json({ message: "List of users", data: users });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
});

//to fetch only me user
UserRouter.get("/me", ensureAuthentication, async (req, res) => {
  const { userId } = req.user; // Getting userId from the JWT (req.user)
  console.log(req.user);
  try {
    const authenticatedUser = await userModel.findById(req.user.userId);
    if (!authenticatedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    return res
      .status(200)
      .json({ message: "Authenticated user details", data: authenticatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = { UserRouter };
