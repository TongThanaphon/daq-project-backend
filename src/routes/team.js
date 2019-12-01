const express = require("express");
const mysql = require("mysql");
const config = require("../config/dbconfig");
const router = express.Router();

const db = mysql.createConnection(config.dbOptions);

router.get("/", (req, res, next) => {
  db.connect(err => {
    if (err) throw err;
    db.query("select * from team", (err, data, fields) => {
      res.json({
        result: data
      });
    });
  });
});

module.exports = router;
