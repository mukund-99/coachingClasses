const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express();
// const session = require('express-session');

app.use(session({
  secret: 'your-secret-key', // Change this to a secure random string
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(bodyparser.json());

app.use(express.static('public/'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
require('dotenv').config();

app.use("/", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

app.listen(process.env.PORT || 1100);