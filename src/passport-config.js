const passport = require("passport"),
  LocalStrategy = require("passport-local").Strategy,
  User = require("./models/user");

const customFields = {
  usernameField: "email",
  passwordField: "password",
};

const verifyCallback = async (username, password, done) => {
  try {
    const user = await User.findByCredentials(username, password);
    return done(null, user);
  } catch (e) {
    return done(null, false);
  }
};

const strategy = new LocalStrategy(customFields, verifyCallback);

passport.use(strategy);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((userId, done) => {
  User.findById(userId)
    .then((user) => {
      done(null, user);
    })
    .catch((err) => done(err));
});
