const unirest = require("unirest");
const mysql = require("mysql");
const util = require("util");
const dbConfig = require("../config/dbconfig");
const apiConfig = require("../config/apiconfig");

const leagueId = ["524", "2", "37", "56"];
const db = mysql.createConnection(dbConfig.dbOptions);
const query = util.promisify(db.query).bind(db);

leagueId.map(id => {
  var req = unirest(
    "GET",
    `https://api-football-v1.p.rapidapi.com/v2/leagueTable/${id}`
  );

  req.headers({
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": `${apiConfig.apiKey}`
  });

  req.end(res => {
    if (res.error) throw new Error(res.error);

    var json = res.body.api.standings[0];

    json.map(data => {
      var rankId = id + data.rank;
      db.connect(async () => {
        try {
          await query(`truncate table ranking`);

          await query(`
              insert into ranking (rankId, seasonId, teamId, order, points, goalsDiff, win, lose, draw)
              values ('${rankId}', '${id}', '${data.team_id}', '${data.rank}', '${data.points}', '${data.goalsDiff}', '${data.all.win}', '${data.all.lose}', '${data.all.draw}')
          `);
        } finally {
          db.end();
        }
      });
    });
  });
});
