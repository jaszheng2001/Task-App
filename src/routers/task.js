const express = require("express");
const Task = require("../models/task");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/tasks", auth, async (req, res) => {
  const task = new Task({ ...req.body, owner: req.user._id });
  try {
    await task.save();
    res.status(201).redirect("tasks");
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/tasks", auth, async (req, res) => {
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
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/tasks/:id", auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.status(200).send(task);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    res.status(400).send({ error: "Invalid Updates!" });
  }

  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    updates.forEach((update) => (task[update] = req.body[update]));
    await task.save();
    res.send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });

    if (!task) {
      return res.status(404).send();
    }

    res.status(200).send(task);
  } catch (e) {
    res.status(400).send();
  }
});

module.exports = router;
