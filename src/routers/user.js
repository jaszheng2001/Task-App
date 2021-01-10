const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const passport = require("passport");
const router = new express.Router();

// Register account
router.post("/users", async (req, res) => {
  const user = new User(req.body);
  try {
    await user.save();
    res.status(201).send({ user });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login
router.post(
  "/users/login",
  passport.authenticate("local", (err, user) => {
    if (!err) return res.send({ user });
    res.status(400).send("Unable to authenticate");
  })
);

//Logout of account
router.post("/users/logout", auth, async (req, res) => {
  req.logout();
  res.status(201).send("Succssful");
});

//View profile
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

//Update profile
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidUpdate = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidUpdate) {
    return res.status(400).send({ error: "Invalid updates!" });
  }
  try {
    const user = req.user;

    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();
    res.status(201).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Deactivate your account
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.status(201).send(req.user);
  } catch (e) {
    res.status(400).send();
  }
});

//Add a photo to your profile
const upload = multer({
  limits: {
    fileSize: 10000000,
  },
  fileFilter(req, file, cb) {
    if (
      !(
        file.originalname.endsWith(".jpg") ||
        file.originalname.endsWith(".jpeg") ||
        file.originalname.endsWith(".png")
      )
    ) {
      return cb(new Error("Please upload a image"));
    }
    cb(undefined, true);
  },
});

router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    const buffer = await sharp(req.file.buffer)
      .resize({ width: 250, height: 250 })
      .png()
      .toBuffer();
    req.user.avatar = buffer;
    await req.user.save();
    res.send();
  },
  (err, req, res, next) => {
    res.status(400).send({ error: err.message });
  }
);

//Remove profile picture
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.status(200).send();
});

//Get profile picture
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || !user.avatar) {
      throw new Error();
    }
    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  } catch (e) {}
});

module.exports = router;
