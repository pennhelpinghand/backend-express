/**
 * Main file for the twilio server.
 **/

// loading environment variables
const dotenv = require("dotenv");
dotenv.config();

// getting twilio credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_NUMBER = "+14159938057";

const express = require("express");
const app = express();
const port = 3000;

const bodyParser = require("body-parser");
const client = require("twilio")(accountSid, authToken);

app.use(bodyParser.json());

app.post("/register_helping_hand", (req, res) => {
  const { hhName, hhPhone, userName } = req.body;

  if (!hhName || !hhPhone) {
    res.sendStatus(400);
  }

  const msg =
    `Hey ${hhName}! ${userName} is trusting you to be their Helping Hand to ` +
    `help them recover from nicotine substance abuse.` +
    `\n\nHere are some resources.` +
    `\n\n\Understand nicotine withdrawal symptoms: https://smokefree.gov/challenges-when-quitting/withdrawal/understanding-withdrawal` +
    `\n\nUnderstand how to support your loved one: https://www.cancer.org/healthy/stay-away-from-tobacco/helping-a-smoker-quit.html`;

  client.messages
    .create({ body: msg, from: TWILIO_NUMBER, to: hhPhone })
    .then(message => console.log(message.sid))
    .then(() => res.sendStatus(200))
    .catch(err => console.error(err));
});

app.post("/request_help", (req, res) => {
  const { hhName, hhPhone, userName, userPhone } = req.body;

  if (!hhName || !hhPhone || !userName || !userPhone) {
    res.sendStatus(400);
  }

  const msg =
    `${hhName}, ${userName}'s biosignals are elevated and seems to be experiencing nicotine withdrawal symptoms. Please reach out to ${userName} and offer a hand of support at ${userPhone} if you can.` +
    `\n\nThese are resources to aid you in supporting your loved one in need.` +
    `\n\n\Helping a Smoker Quit: DO's and Dont's: https://www.cancer.org/healthy/stay-away-from-tobacco/helping-a-smoker-quit.html` +
    `\n\nHow to Support Your Quitter: https://smokefree.gov/help-others-quit/family-friends/how-support-your-quitter`;

  client.messages
    .create({
      body: msg,
      from: TWILIO_NUMBER,
      to: hhPhone
    })
    .then(message => console.log(message.sid))
    .then(() => res.sendStatus(200))
    .catch(err => console.error(err));
});

app.post("/encourage", (req, res) => {
  const {
    hhName,
    hhPhone,
    userName,
    userPhone,
    daysStreakFree,
    numConsistentExercise
  } = req.body;

  if (
    (!hhName || !hhPhone || !userName || !userPhone,
    !daysStreakFree,
    !numConsistentExercise)
  ) {
    res.sendStatus(400);
  }

  const msg =
    `${hhName}! Give ${userName} a pat on the back! ${userName} has been ${daysStreakFree} days free from nicotine and has consistently exercised for ${numConsistentExercise} days.` +
    `Give him a word of encouragement @ ${userPhone}!`;

  client.messages
    .create({
      body: msg,
      from: TWILIO_NUMBER,
      to: hhPhone
    })
    .then(message => console.log(message.sid))
    .then(() => res.sendStatus(200))
    .catch(err => console.error(err));
});

// firebase
const admin = require("firebase-admin");

let serviceAccount = require("./helpinghand-secret.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();
let testUser = db.collection("users").doc("testUser");

app.get("/trigger_alert", (req, res) => {
  testUser.update({ hhAssistance: true, withdrawalTime: new Date() });
  res.sendStatus(200);
});

app.get("/set_encouragement", (req, res) => {
  testUser.update({ daysClean: 90, exerciseDays: 105, dollarsSaved: 417 });
  res.sendStatus(200);
});

app.get("/reset_statistics", (req, res) => {
  testUser.update({ daysClean: 0, exerciseDays: 1, dollarsSaved: 0 });
  res.sendStatus(200);
});

app.listen(port, () =>
  console.log(`Helping Hand Twilio Server listening on port ${port}!`)
);
