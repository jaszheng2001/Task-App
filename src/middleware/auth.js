const auth = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.render("index", { error: "Please authenticate" });
  }
};
module.exports = auth;
