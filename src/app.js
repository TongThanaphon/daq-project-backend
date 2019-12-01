const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");

const app = express();

// const seasonRoutes = require();
const teamRoutes = require("./routes/team");
// const matchRoutes = require();
// const statisticRoutes = require();

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use("/team", teamRoutes);

app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
