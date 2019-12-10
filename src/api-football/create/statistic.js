const unirest = require("unirest");
const mysql = require("mysql");
const util = require("util");
const dbConfig = require("../../config/dbconfig");
const apiConfig = require("../../config/apiconfig");

const db = mysql.createConnection(dbConfig.dbOptions);
const query = util.promisify(db.query).bind(db);

db.connect(() => {
  query(
    "select compId from competition where status = 'Match Finished'",
    (err, data, fields) => {
      const compId = data;

      compId.map(id => {
        var req = unirest(
          "GET",
          `https://api-football-v1.p.rapidapi.com/v2/statistics/fixture/${id.compId}`
        );

        req.headers({
          "x-rapidapi-host": "api-football-v1.p.rapidapi.com",
          "x-rapidapi-key": `${apiConfig.apiKey}`
        });

        req.end(async res => {
          if (res.error) throw new Error(res.error);
          var json = res.body.api.statistics;
          // if (json.length != 0) {
          var shotsOnGoal = json["Shots on Goal"];
          var shotsOffGoal = json["Shots off Goal"];
          var totalShots = json["Total Shots"];
          var blockedShots = json["Blocked Shots"];
          var shotsInsidebox = json["Shots insidebox"];
          var shotsOutsidebox = json["Shots outsidebox"];
          var fouls = json["Fouls"];
          var cornerKicks = json["Corner Kicks"];
          var offsides = json["Offsides"];
          var ballPossession = json["Ball Possession"];
          var yellowCards = json["Yellow Cards"];
          var redCards = json["Red Cards"];
          var goalkeeperSaves = json["Goalkeeper Saves"];
          var totalPasses = json["Total passes"];
          var passAccurate = json["Passes accurate"];
          var passedPercentage = json["Passes %"];
          //   db.connect(async () => {
          try {
            // await query(`truncate table statistic`);
            await query(`
                        insert into statistic (
                            statisticId,
                            shotsOnGoal,
                            shotsOffGoal,
                            totalShots,
                            blockedShots,
                            shotsInsidebox,
                            shotsOutsidebox,
                            fouls,
                            cornerKicks,
                            offsides,
                            ballPossession,
                            yellowCards,
                            redCards,
                            goalkeeperSaves,
                            totalPasses,
                            passAccurate,
                            passedPercentage
                             )
                        values (
                            '${id.compId}',
                            '{"home": "${shotsOnGoal.home}", "away": "${shotsOnGoal.away}"}',
                            '{"home": "${shotsOffGoal.home}", "away": "${shotsOffGoal.away}"}',
                            '{"home": "${totalShots.home}", "away": "${totalShots.away}"}',
                            '{"home": "${blockedShots.home}", "away": "${blockedShots.away}"}',
                            '{"home": "${shotsInsidebox.home}", "away": "${shotsInsidebox.away}"}',
                            '{"home": "${shotsOutsidebox.home}", "away": "${shotsOutsidebox.away}"}',
                            '{"home": "${fouls.home}", "away": "${fouls.away}"}',
                            '{"home": "${cornerKicks.home}", "away": "${cornerKicks.away}"}',
                            '{"home": "${offsides.home}", "away": "${offsides.away}"}',
                            '{"home": "${ballPossession.home}", "away": "${ballPossession.away}"}',
                            '{"home": "${yellowCards.home}", "away": "${yellowCards.away}"}',
                            '{"home": "${redCards.home}", "away": "${redCards.away}"}',
                            '{"home": "${goalkeeperSaves.home}", "away": "${goalkeeperSaves.away}"}',
                            '{"home": "${totalPasses.home}", "away": "${totalPasses.away}"}',
                            '{"home": "${passAccurate.home}", "away": "${passAccurate.away}"}',
                            '{"home": "${passedPercentage.home}", "away": "${passedPercentage.away}"}'
                              )
                        on duplicate key update statisticId = '${id.compId}'
                              `);
          } catch (error) {
            console.log(error);
          } finally {
            // db.end();
          }
          //   });
          // }
        });
      });
    }
  );
});
