var express = require("express");
var authRouter = require("./auth");
var bookRouter = require("./book");
var classRouter = require("./class2");
var studentRouter = require("./student");

var app = express();

app.use("/auth/", authRouter);
app.use("/book/", bookRouter);
app.use("/class/", classRouter);
app.use("/student/", studentRouter);
module.exports = app;