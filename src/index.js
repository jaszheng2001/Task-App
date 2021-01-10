const express = require("express");
const mongoose = require("./db/mongoose");
const User = require("./models/user");
const Task = require("./models/task");
const userRouter = require("./routers/user");
const taskRouter = require("./routers/task");
const passport = require("passport");
const session = require("express-session");
const auth = require("./middleware/auth");
require("dotenv").config();

const app = express();

app.use(
  session({
    secret: process.env.JWT_SECRET,
    saveUninitialized: false,
    resave: true,
  })
);
require("./passport-config");

app.use(passport.initialize());
app.use(passport.session());

const port = process.env.PORT;
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", userRouter);
app.use("/api", taskRouter);

app.get("/", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("dashboard");
  res.render("index", { error: "" });
});

app.get("/register", (req, res) => {
  if (req.isAuthenticated()) return res.redirect("dashboard");
  res.render("register", { error: "" });
});

app.get("/dashboard", auth, async (req, res) => {
  try {
    const match = { owner: req.user._id };
    const sortBy = {};
    let sort = req.query.sortBy;
    let completed = req.query.completed;

    if (completed) {
      match.completed = completed === "true";
    }

    if (sort) {
      sort = sort.split(":");
      sortBy[sort[0]] = sort[1] === "desc" ? -1 : 1;
    }

    try {
      const task = await Task.find(match, null, {
        sort: sortBy,
        limit: parseInt(req.query.limit),
        skip: parseInt(req.query.skip),
      });
      res.render("dashboard", { name: req.user.name, tasks: task });
    } catch (e) {
      res.render("dashboard", { name: req.user.name, tasks: {} });
    }
  } catch (err) {
    console.log("error");
    console.log(err);
    console.log(JSON.stringify(err));
    res.render("dashboard", { name: req.user.name, tasks: [] });
  }
});

app.get("/logout", auth, async (req, res) => {
  req.logout();
  res.status(201).redirect("/");
});

app.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.status(201).redirect("dashboard");
    });
  } catch (e) {
    return res.status(400).render("register", {
      error: "Registration failed, please use a different email",
    });
  }
});

app.get("/*", (req, res) => {
  res.send("Page not found");
});

app.post("/login", function (req, res, next) {
  passport.authenticate("local", function (err, user) {
    if (!user) {
      res.render("index", { error: "Unable to Authenticate" });
    } else {
      req.login(user, (err) => {
        if (err) return next(err);
        return res.redirect("/dashboard");
      });
    }
  })(req, res, next);
});

app.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.redirect("dashboard");
  } catch (e) {
    res.redirect("dashboard");
  }
});

app.listen(port, () => {
  console.log("Server is up on port " + port);
});
