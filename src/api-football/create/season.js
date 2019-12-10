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
    `https://api-football-v1.p.rapidapi.com/v2/leagues/league/${id}`
  );

  req.headers({
    "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
    "x-rapidapi-key": `${apiConfig.apiKey}`
  });

  req.end(res => {
    if (res.error) throw new Error(res.error);

    var json = res.body.api.leagues;
    var rankIds = [];
    var compIds = [];
    var teamIds = [];

    db.connect(async () => {
      try {
        const compQuery = await query(
          `select compId from competition where seasonId = ${id}`
        );

        const rankQuery = await query(
          `select rankId, teamId from ranking where seasonId = ${id}`
        );

        compQuery.map(c => {
          compIds.push(c.compId);
        });

        rankQuery.map(r => {
          rankIds.push(r.rankId);
          teamIds.push(r.teamId);
        });

        await query(`truncate table season`);

        await query(`
          insert into season (seasonId, year, seasonStart, seasonEnd, teams, ranking, matches)
          values ('${id}', '${json[0].season}', '${json[0].season_start}', '${json[0].season_end}', '{"teams": [${teamIds}]}', '{"rankIds": [${rankIds}]}', '{"compIds": [${compIds}]}')
        `);
      } finally {
        // db.end();
      }
    });
  });
});
