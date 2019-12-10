const unirest = require("unirest");
const mysql = require("mysql");
const util = require("util");
const dbConfig = require("../../config/dbconfig");
const apiConfig = require("../../config/apiconfig");
const leagueConfig = require("../../config/leageconfig");

const db = mysql.createConnection(dbConfig.dbOptions);
const query = util.promisify(db.query).bind(db);
const leagueId = leagueConfig.leagueId[0];

db.connect(async () => {
  try {
    var fixtures = await query(
      `select * from competition where status = 'Not Started' and seasonId = ${leagueId}`
    );

    await fixtures.map(fixture => {
      var req = unirest(
        "GET",
        `https://api-football-v1.p.rapidapi.com/v2/fixtures/id/${fixture.compId}`
      );
      req.query({
        timezone: "Asia/Bangkok"
      });
      req.headers({
        "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
        "x-rapidapi-key": `${apiConfig.apiKey}`
      });
      req.end(res => {
        if (res.error) throw new Error(res.error);
        var json = res.body.api.fixtures;
        json.map(data => {
          var sql =
            "UPDATE competition SET `eventDate` = ?, `status` = ?, `goals` = ?, `scores` = ? WHERE `compId` = ?";
          var values = [
            `${data.event_date}`,
            `${data.status}`,
            `{"home": "${data.goalsHomeTeam}", "away": "${data.goalsAwayTeam}"}`,
            `${data.score.fulltime}`,
            `${data.fixture_id}`
          ];
          query(sql, values, (error, results, fields) => {
            if (error) {
              return console.error(error.message);
            }
            console.log("Rows affected:", results.affectedRows);
          });
        });
      });
    });
  } finally {
    // db.end();
  }
});
