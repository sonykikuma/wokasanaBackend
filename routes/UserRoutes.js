require("dotenv").config();
const UserRouter = require("express").Router();

const { ValidUserAuthentication } = require("../utils/ValidUserAuthentication");
const bcrypt = require("bcrypt");
const { userModel } = require("../models/userModel");
const jwt = require("jsonwebtoken");

// user template Route
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

// user template Route
UserRouter.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userFromDB = await userModel.findOne({ email });
    console.log(`userFromDB`, userFromDB);
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
        return res.status(200).json({ message: "login successful", token });
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

// user template Route
UserRouter.get("/auth/google", (req, res) => {
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL}/user/auth/google/callback&response_type=code&scope=email profile`;
  res.redirect(url);
  console.log(`hit auth google`);
});

// user template Route
UserRouter.get("/auth/google/callback", async (req, res) => {
  const { code } = req.query;
  try {
    // Get access token
    const fetchRes = await fetch(`https://oauth2.googleapis.com/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BACKEND_URL}/user/auth/google/callback`,
        code,
        grant_type: "authorization_code",
      }).toString(),
    });
    const data = await fetchRes.json();
    const { access_token } = data;

    // Fetch user info
    const fetchRes2 = await fetch(
      "https://www.googleapis.com/oauth2/v1/userinfo",
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    const data2 = await fetchRes2.json();
    const { email, name } = data2;

    // Check if user exists
    const userFromDB = await userModel.findOne({ email });
    if (userFromDB) {
      const token = jwt.sign(
        {
          email: userFromDB.email,
          name: userFromDB.name,
          userId: userFromDB._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRY || "10h",
        }
      );
      // return res.status(200).json({ message: "Login successful", token });
      return res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    } else {
      // Create new user
      const newUser = new userModel({ name, email, oauth: true });
      const savedNewUser = await newUser.save();
      const token = jwt.sign(
        {
          email: savedNewUser.email,
          name: savedNewUser.name,
          userId: userFromDB._id,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "10h",
        }
      );
      // return res.status(200).json({ message: "Login successful", token });
      return res.redirect(`${process.env.FRONTEND_URL}?token=${token}`);
    }
  } catch (err) {
    console.error(err);
    // return res.status(500).json({ message: "Internal Server Error" });
    return res.redirect(`${process.env.FRONTEND_URL}/signin`);
  }
});

UserRouter.get("/", ValidUserAuthentication, async (req, res) => {
  try {
    // const users = await userModel.find({ email: { $nin: [req.user.email] } });
    const users = await userModel.find();
    return res.status(200).json({ message: "List of users", data: users });
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
});

module.exports = { UserRouter };
