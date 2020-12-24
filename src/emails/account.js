const sgMail = require("@sendgrid/mail");
require("dotenv").config();
sgMail.setApiKey(process.env.SG_API_KEY);

const sendWelcomeEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "jaszheng2001@gmail.com",
    subject: "Thanks for joining",
    text: `Welcome to the app, ${name}. Let me know how you get along with the app`,
  });
};

const sendFarewellEmail = (email, name) => {
  sgMail.send({
    to: email,
    from: "jaszheng2001@gmail.com",
    subject: "Sorry to see you go",
    text: `Goodbye, ${name}, I hope to see you back sometimes soon!`,
  });
};
module.exports = { sendWelcomeEmail, sendFarewellEmail };
