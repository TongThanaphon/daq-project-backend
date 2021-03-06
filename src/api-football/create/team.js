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
    `https://api-football-v1.p.rapidapi.com/v2/teams/league/${id}`
  );

  req.headers({
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": `${apiConfig.apiKey}`
  });

  req.end(res => {
    if (res.error) throw new Error(res.error);

    var json = res.body.api.teams;

    json.map(data => {
      db.connect(async () => {
        try {
          await query(`truncate table team`);

          await query(
            `insert into team (teamId, teamName, teamLogo)
          values ('${data.team_id}', '${data.name}', '${data.logo}')
          on duplicate key update teamId = '${data.team_id}'`
          );
        } finally {
          // db.end();
        }
      });
    });
  });
});
