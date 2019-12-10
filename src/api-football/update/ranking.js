const unirest = require("unirest");
const mysql = require("mysql");
const util = require("util");
const dbConfig = require("../../config/dbconfig");
const apiConfig = require("../../config/apiconfig");
const leagueConfig = require("../../config/leageconfig");

const db = mysql.createConnection(dbConfig.dbOptions);
const query = util.promisify(db.query).bind(db);
const leagueId = leagueConfig.leagueId[0];

var req = unirest(
  "GET",
  `https://api-football-v1.p.rapidapi.com/v2/leagueTable/${leagueId}`
);

req.headers({
  "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
  "x-rapidapi-key": `${apiConfig.apiKey}`
});

req.end(res => {
  if (res.error) throw new Error(res.error);

  var json = res.body.api.standings[0];

  json.map(data => {
    var rankId = leagueId + data.rank;
    var sql =
      "UPDATE ranking SET `order` = ?, `points` = ?, `goalsDiff` = ?, `win` = ?, `lose` = ?, `draw` = ? WHERE `rankId` = ?";
    var values = [
      `${data.rank}`,
      `${data.points}`,
      `${data.goalsDiff}`,
      `${data.all.win}`,
      `${data.all.lose}`,
      `${data.all.draw}`,
      `${rankId}`
    ];

    db.connect(async () => {
      try {
        await query(sql, values, (error, results, fields) => {
          if (error) {
            return console.error(error.message);
          }
          console.log("Rows affected:", results.affectedRows);
        });
      } finally {
        db.end();
      }
    });
  });
});
