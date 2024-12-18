require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { UserRouter } = require("./routes/UserRoutes");
const { TaskRouter } = require("./routes/TaskRoutes");
const { TeamRouter } = require("./routes/TeamRoutes");
const { ProjectRouter } = require("./routes/ProjectRoutes");
const { TagRouter } = require("./routes/TagRoutes");
const { ReportRouter } = require("./routes/ReportRoutes");
const { initializeDatabase } = require("./dbConnect");
initializeDatabase();

const app = express();

app.use(
  cors()
  // cors({
  //   origin: "*",
  //   methods: ["POST", "GET", "PATCH", "PUT"],
  //   allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  //   credentials: true,
  //   optionsSuccessStatus: 200,
  // })
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
  res.send("Hello, Express");

  // res.status(200).send({ message: "Hello world" });
});

app.listen(3000, () => console.log(` Server is running on port 3000`));
