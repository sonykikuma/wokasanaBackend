require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { UserRouter } = require("../routes/UserRoutes");
const { TaskRouter } = require("../routes/TaskRoutes");
const { TeamRouter } = require("../routes/TeamRoutes");
const { ProjectRouter } = require("../routes/ProjectRoutes");
const { TagRouter } = require("../routes/TagRoutes");
const { ReportRouter } = require("../routes/ReportRoutes");
const { dbConnectionFunction } = require("../utils/dbConnect");
dbConnectionFunction();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["POST", "GET", "PATCH", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use("/user", UserRouter);
app.use("/tasks", TaskRouter);
app.use("/teams", TeamRouter);
app.use("/projects", ProjectRouter);
app.use("/tags", TagRouter);
app.use("/report", ReportRouter);

app.get("/", (req, res) => {
  req.statusCode(200).json({ message: "backend is live" });
});

app.listen(process.env.PORT || 5500, () => console.log(`Web Server is online`));
