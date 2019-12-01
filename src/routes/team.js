const express = require("express");
const mysql = require("mysql");
const config = require("../config/dbconfig");

const router = express.Router();
const db = mysql.createConnection(config.dbOptions);

router.get("/", (req, res, next) => {
  db.connect(() => {
    db.query(`select * from team`, (err, data, fields) => {
      if (err) throw err;
      res.status(200).json({
        teams: data
      });
    });
  });
});

router.get("/:teamId", (req, res, next) => {
  const teamId = req.params.teamId;

  db.connect(() => {
    db.query(
      `select * from team where teamId = ${teamId}`,
      (err, data, fields) => {
        if (err) throw err;
        res.status(200).json({
          team: data[0]
        });
      }
    );
  });
});

router.get("/statistic/:teamId", (req, res, next) => {
  const teamId = req.params.teamId;

  db.connect(() => {
    db.query(
      `
    SELECT home.seasonId, season.year, ranking.order, AVG(home.shotOnGoal) AS avgShotOnGoal,AVG(home.blockedShots) AS avgBlockedShots, AVG(home.fouls) AS avgFouls, AVG(home.ballPossession) AS avgBallPossession, AVG(home.goalKeeperSaves) AS avgGoalKeeperSaves,AVG(home.totalPasses) AS avgTotalPasses, AVG(home.passAccurate) AS avgPassAccurate
    FROM (SELECT competition.seasonId, competition.home ,(statistic.shotsOnGoal->"$.home") AS shotOnGoal, (statistic.blockedShots->"$.home") AS blockedShots, (statistic.fouls->"$.home") AS fouls, (statistic.ballPossession->"$.home") AS ballPossession, 			(statistic.goalkeeperSaves->"$.home") AS goalKeeperSaves, (statistic.totalPasses->"$.home") AS totalPasses, (statistic.passAccurate->"$.home") AS passAccurate
	FROM competition
	INNER JOIN statistic ON competition.compId = statistic.statisticId
    INNER JOIN ranking ON competition.seasonId = ranking.seasonId
	WHERE competition.home = ${teamId} AND competition.home = ranking.teamId
          ORDER BY ranking.order
     ) AS home INNER JOIN
     (SELECT competition.seasonId ,(statistic.shotsOnGoal->"$.away") AS shotOnGoal, (statistic.blockedShots->"$.away") AS blockedShots, (statistic.fouls->"$.away") AS fouls, (statistic.ballPossession->"$.away") AS ballPossession, 			(statistic.goalkeeperSaves->"$.away") AS goalKeeperSaves, (statistic.totalPasses->"$.away") AS totalPasses, (statistic.passAccurate->"$.away") AS passAccurate
	FROM competition
	INNER JOIN statistic ON competition.compId = statistic.statisticId
    INNER JOIN ranking ON competition.seasonId = ranking.seasonId
	WHERE competition.away = ${teamId} AND competition.away = ranking.teamId
      ORDER BY ranking.order
     ) AS away ON home.seasonId = away.seasonId
     INNER JOIN season ON home.seasonId = season.seasonId
     INNER JOIN ranking ON ranking.teamId = home.home AND ranking.seasonId = home.seasonId
     GROUP BY home.seasonId, ranking.order
    `,
      (err, data, fields) => {
        if (err) throw err;

        res.status(200).json({
          results: data
        });
      }
    );
  });
});

module.exports = router;
