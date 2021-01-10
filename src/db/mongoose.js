const { connect } = require("mongodb");
const mongoose = require("mongoose");
require("dotenv").config();

const connection = mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
});

module.exports = connection;
