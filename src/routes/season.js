const express = require("express");
const mysql = require("mysql");
const dbCOnfig = require("../config/dbconfig");

const router = express.Router();
const db = mysql.createConnection(dbCOnfig.dbOptions);

router.get("/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
          select ranking.order, 
              team.teamId, 
              team.teamName, 
              team.teamLogo,
              ranking.win,
              ranking.lose,
              ranking.draw,
              ranking.goalsDiff,
              ranking.points
          from team
          inner join ranking
          on team.teamId = ranking.teamId
          where ranking.seasonId = ${seasonId}
        `,
      (err, data, fields) => {
        if (err) throw err;

        res.status(200).json({
          teams: data
        });
      }
    );
  });
});

router.get("/shotsongoal/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
        select home.home, avg(home.shotOnGoal) as avgShotOnGoal
        from (select ranking.order, competition.home, (statistic.shotsOnGoal->"$.home") as shotOnGoal
        from competition
        inner join statistic on competition.compId = statistic.statisticId
        inner join ranking on competition.home = ranking.teamId
        where ranking.seasonId = ${seasonId} and ranking.seasonId = competition.seasonId
        order by ranking.order) as home
        inner join (select ranking.order, competition.away, (statistic.shotsOnGoal->"$.away") as shotOnGoal
        from competition
        inner join statistic on competition.compId = statistic.statisticId
        inner join ranking on competition.away = ranking.teamId
        where ranking.seasonId = ${seasonId} and ranking.seasonId = competition.seasonId
        order by ranking.order) as away on home.home = away.away
        group by home.home
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

router.get("/fouls/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
      SELECT team.teamId,team.teamName,team.teamLogo,AVG(home.fouls) AS avgfouls
      FROM (SELECT ranking.order,competition.home ,(statistic.fouls->"$.home") AS fouls
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.home = ranking.teamId
      WHERE ranking.seasonId = %s AND ranking.seasonId = competition.seasonId
            ORDER BY ranking.order
       ) AS home INNER JOIN
       (SELECT ranking.order,competition.away ,(statistic.fouls->"$.away") AS fouls
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.away = ranking.teamId
      WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
        ORDER BY ranking.order
       ) AS away ON home.home = away.away
       INNER JOIN team ON home.home = team.teamId
       GROUP BY home.home
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

router.get("/ballpossession/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
        SELECT team.teamId,team.teamName,team.teamLogo,AVG(home.BallPossession) AS avgBallPoessession
        FROM (SELECT ranking.order,competition.home ,(statistic.ballPossession->"$.home") AS BallPossession
        FROM competition
        INNER JOIN statistic ON competition.compId = statistic.statisticId
        INNER JOIN ranking ON competition.home = ranking.teamId
        WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
              ORDER BY ranking.order
         ) AS home INNER JOIN
         (SELECT ranking.order,competition.away ,(statistic.ballPossession->"$.away") AS BallPossession
        FROM competition
        INNER JOIN statistic ON competition.compId = statistic.statisticId
        INNER JOIN ranking ON competition.away = ranking.teamId
        WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
          ORDER BY ranking.order
         ) AS away ON home.home = away.away
         INNER JOIN team ON home.home = team.teamId
         GROUP BY home.home
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

router.get("/goalkeepersave/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
      SELECT team.teamId,team.teamName,team.teamLogo,AVG(home.goalKeeperSaves) AS avgGoalKeeperSaves
      FROM (SELECT ranking.order,competition.home ,(statistic.goalkeeperSaves->"$.home") AS goalKeeperSaves
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.home = ranking.teamId
      WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
            ORDER BY ranking.order
       ) AS home INNER JOIN
       (SELECT ranking.order,competition.away ,(statistic.goalkeeperSaves->"$.away") AS goalKeeperSaves
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.away = ranking.teamId
      WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
        ORDER BY ranking.order
       ) AS away ON home.home = away.away
       INNER JOIN team ON home.home = team.teamId
       GROUP BY home.home
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

router.get("/blockedshots/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
      SELECT team.teamId,team.teamName,team.teamLogo,AVG(home.blockedShots) AS avgBlockedShots
      FROM (SELECT ranking.order,competition.home ,(statistic.blockedShots->"$.home") AS blockedShots
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.home = ranking.teamId
      WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
            ORDER BY ranking.order
       ) AS home INNER JOIN
       (SELECT ranking.order,competition.away ,(statistic.blockedShots->"$.away") AS blockedShots
      FROM competition
      INNER JOIN statistic ON competition.compId = statistic.statisticId
      INNER JOIN ranking ON competition.away = ranking.teamId
      WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
        ORDER BY ranking.order
       ) AS away ON home.home = away.away
       INNER JOIN team ON home.home = team.teamId
       GROUP BY home.home
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

router.get("/totalpassandaccurate/:seasonId", (req, res, next) => {
  const seasonId = req.params.seasonId;

  db.connect(() => {
    db.query(
      `
        SELECT team.teamId,team.teamName,team.teamLogo,AVG(home.totalPasses) AS avgtotalPasses, AVG(home.passAccurate) AS avgPassAccurate
        FROM (SELECT ranking.order,competition.home ,(statistic.totalPasses->"$.home") AS totalPasses, (statistic.passAccurate->"$.home") AS passAccurate
        FROM competition
        INNER JOIN statistic ON competition.compId = statistic.statisticId
        INNER JOIN ranking ON competition.home = ranking.teamId
        WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
              ORDER BY ranking.order
         ) AS home INNER JOIN
         (SELECT ranking.order,competition.away ,(statistic.totalPasses->"$.away") AS totalPasses, (statistic.passAccurate->"$.away") AS passAccurate
        FROM competition
        INNER JOIN statistic ON competition.compId = statistic.statisticId
        INNER JOIN ranking ON competition.away = ranking.teamId
        WHERE ranking.seasonId = ${seasonId} AND ranking.seasonId = competition.seasonId
          ORDER BY ranking.order
         ) AS away ON home.home = away.away
         INNER JOIN team ON home.home = team.teamId
         GROUP BY home.home
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
