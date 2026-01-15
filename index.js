const express = require('express');
const bodyparser = require('body-parser');
const session = require('express-session');
const path = require('path');
const app = express()

app.use(express.static('public/'));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
require('dotenv').config();

app.use("/", require("./routes/user"));
app.use("/admin", require("./routes/admin"));

app.listen(process.env.PORT || 1100);