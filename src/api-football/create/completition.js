const unirest = require("unirest");
const mysql = require("mysql");
const util = require("util");
const dbConfig = require("../../config/dbconfig");
const apiConfig = require("../../config/apiconfig");
const leagueConfig = require("../../config/leageconfig");

const db = mysql.createConnection(dbConfig.dbOptions);
const query = util.promisify(db.query).bind(db);
const leagueId = leagueConfig.leagueId;

leagueId.map(id => {
  var req = unirest(
    "GET",
    `https://api-football-v1.p.rapidapi.com/v2/fixtures/league/${id}`
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
      db.connect(async () => {
        try {
          await query(`truncate table competition`);

          await query(`
            insert into competition (compId, seasonId, eventDate, status, home, away, goals, scores)
            values ('${data.fixture_id}', '${id}', '${data.event_date}', '${data.status}', '${data.homeTeam.team_id}',
            '${data.awayTeam.team_id}', '{"home": "${data.goalsHomeTeam}", "away": "${data.goalsAwayTeam}"}', '${data.score.fulltime}')
            `);
        } finally {
          // db.end();
        }
      });
    });
  });
});
