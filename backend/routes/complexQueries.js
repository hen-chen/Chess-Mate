const express = require('express')
const router = express.Router()
const mysql = require('mysql')

// private connection credentials to connect to our database
const config = require('../config.json')

// connection
const connection = mysql.createPool({
  connectionLimit: 20,
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
})



// map used for caching with the query below
let myMap4 = new Map()

// Return a list of 100 usrs with similar rating history
router.get('/fidetolichesshistory/', (req, res) => {
  const { fideId, lichessType, fideType, limit } = req.query // required
  const key = `${fideId}-${lichessType}-${fideType}`
  // example params:
  // const lichessType = "'blitz'"
  // const fideType = "'classical'"
  const threshold = 400

  if (myMap4.has(key)) {
    res.json({results: myMap4.get(key)})
  } else {
      connection.query(
        `
        WITH MergedHistory AS (
            SELECT fideId, F.month AS month, F.year AS year, F.rating AS fideRating, L.rating AS lichessRating, lichessId
            FROM (SELECT * FROM FideHistory WHERE fideId = ${fideId} AND type = "${fideType}") F
                    JOIN (SELECT * FROM LichessHistory WHERE type = "${lichessType}") L 
                    ON F.year = L.year AND F.month = L.month
        )
        SELECT lichessId,
              ABS(AVG(lichessRating - fideRating) - ${threshold}) AS score,
              VARIANCE(lichessRating - fideRating - ${threshold}) AS variance,
              COUNT(*)                                            AS numPoints
        FROM MergedHistory
        GROUP BY lichessId
        ORDER BY score, numPoints DESC, variance DESC
        LIMIT 10
        `,
        (error, results) => resSenderRatingHistory(error, results, res, key),
      )
  }
})

/**
 * Helper function for above query that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 * @param {pass in key for map (caching)} key
 */
 const resSenderRatingHistory = (error, results, res, key) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    myMap4.set(key, results)
    res.json({ results: results })
  }
}





// map used for caching with the query below
let myMap3 = new Map()

/**
 * Find all top level games (where the sum of both players’ elo is >= param elo). Find all the players in these games, and get all the players’ countries. Then find all the users in these countries. Sort the users by country and elo.
 * @param elo the total sum elo (e.g. 4000)
 */
router.get('/topGamesCountryPlayers/:elo', (req, res) => {
  const { elo } = req.params
  // example params:
  // const elo = 3000
  if (myMap3.has(elo)) {
    res.json({results: myMap3.get(elo)})
  } else {
      connection.query(
        `WITH top_games AS (
        SELECT whiteId, blackId
        FROM LichessGames
        WHERE (whiteRating + blackRating) >= ${elo}
      ),
      Countries_top_games_white AS (
        SELECT country
        FROM top_games tg JOIN LichessPlayers lp ON tg.whiteId = lp.id
      ),
      Countries_top_games_black AS (
        SELECT country
        FROM top_games tg JOIN LichessPlayers lp ON tg.blackId = lp.id
      ),
      Countries AS (
        SELECT *
        FROM Countries_top_games_white
        UNION
        SELECT *
        FROM Countries_top_games_black
      )
      SELECT *
      FROM LichessPlayers lp
      WHERE lp.country IN (SELECT * FROM Countries)
      ORDER BY lp.fideRating, lp.country;
      `,
        (error, results) => resSenderTopGame(error, results, res, elo),
      )
  }
})

/**
 * Helper function for above query that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 * @param {pass in elo for map (caching)} elo
 */
 const resSenderTopGame = (error, results, res, elo) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    myMap3.set(elo, results)
    res.json({ results: results })
  }
}





// map used for caching with the query below
let myMap2 = new Map()

/**
 * Find some poor level games (sum of elo is < 2400), and determine all the players’ playtime. Find all the unverified players with elo less than `elo` (with similar playtime). Sort the users by playtime, elo.
 * @param elo fideRating less than this elo
 */
router.get('/poorPlayers/:elo', (req, res) => {
  const { elo } = req.params
  // example params:
  // const elo = 2400
  if (myMap2.has(elo)) {
    res.json({results: myMap2.get(elo)})
  } else {
      connection.query(
        `WITH poor_games AS (
          SELECT whiteId, blackId
          FROM LichessGames
          WHERE (whiteRating + blackRating) <= 2400
        ),
        Playtime_poor_games_white AS (
          SELECT totalPlayTime, fideRating, lp.id
          FROM poor_games pg JOIN LichessPlayers lp ON pg.whiteId = lp.id
        ),
        Playtime_poor_games_black AS (
          SELECT totalPlayTime, fideRating, lp.id
          FROM poor_games pg JOIN LichessPlayers lp ON pg.blackId = lp.id
        ),
        Combine AS (
          SELECT *
          FROM Playtime_poor_games_white
          UNION
          SELECT *
          FROM Playtime_poor_games_black
        )
        SELECT *
        FROM LichessPlayers lp JOIN Combine c ON c.id = lp.id
        WHERE lp.isVerified = 0 AND lp.fideRating < ${elo}
        ORDER BY lp.totalPlayTime, lp.fideRating;
        `,
        (error, results) => resSenderPoorGame(error, results, res, elo),
      )
  }
})

/**
 * Helper function for above query that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 * @param {pass in elo for map (caching)} elo
 */
 const resSenderPoorGame = (error, results, res, elo) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    myMap2.set(elo, results)
    res.json({ results: results })
  }
}







// map used for caching with the query below
let myMap = new Map()

/**
 * Given an `id`, find all openings that `id` player has played. Then, find all the players that play an opening that `id` plays.
 * @param id the player id
 */
router.get('/getSimilarPlayersOpenings/:id', (req, res) => {
  const { id } = req.params
  if (myMap.has(id)) {
    res.json({results: myMap.get(id)})
  } else {
    connection.query(
      `
      WITH black_games AS (
          SELECT eco
          FROM LichessGames
          WHERE blackId = '${id}'
      ),
      white_games AS (
          SELECT eco
          FROM LichessGames
          WHERE whiteId = '${id}'
      ),
      combine AS (
          SELECT eco
          FROM white_games
          UNION
          SELECT eco
          FROM black_games
      ),
      other_users_black AS (
          SELECT username
          FROM LichessPlayers lp JOIN LichessGames LG on lp.id = LG.blackId
          WHERE LG.eco IN (SELECT * FROM combine)
      ),
      other_users_white AS (
          SELECT username
          FROM LichessPlayers lp JOIN LichessGames LG on lp.id = LG.whiteId
          WHERE LG.eco IN (SELECT * FROM combine)
      ),
      combine_others AS (
          SELECT username
          FROM other_users_black
          UNION
          SELECT username
          FROM other_users_white
      )
      SELECT *
      FROM combine_others;
    `,
      (error, results) => resSenderOpening(error, results, res, id),
    )
  }
})

/**
 * Helper function for above query that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 * @param {pass in id for map (caching)} id
 */
 const resSenderOpening = (error, results, res, id) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    myMap.set(id, results)
    res.json({ results: results })
  }
}



// ================== Extras ==================
// map used for caching with the query below
let myMap5 = new Map()

// Return a list of 100 usrs with similar rating history
router.get('/lichesstofidehistory/', (req, res) => {
  const { lichessId, lichessType, fideType, limit } = req.query // required
  const key = `${lichessId}-${lichessType}-${fideType}`
  // example params:
  // const lichessType = "'blitz'"
  // const fideType = "'classical'"
  const threshold = 400

  if (myMap5.has(key)) {
    res.json({results: myMap5.get(key)})
  } else {
      connection.query(
        `
        WITH MergedHistory AS (
          SELECT lichessId, L.month AS month, L.year AS year, L.rating AS lichessRating, F.rating AS fideRating, fideId
          FROM (SELECT * FROM LichessHistory WHERE lichessId = "${lichessId}" AND type = "${lichessType}") L
                  JOIN (SELECT * FROM FideHistory WHERE type = "${fideType}") F
                        ON L.year = F.year AND L.month = F.month
        )
        SELECT id, score, variance, numPoints, firstName, lastName, classicalRating AS rating
        FROM (
                SELECT fideId AS id,
                        ABS(AVG(fideRating - lichessRating) + ${threshold}) AS score,
                        VARIANCE(fideRating - lichessRating + ${threshold}) AS variance,
                        COUNT(*)                                            AS numPoints
                FROM MergedHistory
                GROUP BY fideId
            ) Scores
                NATURAL JOIN (
            SELECT id, firstName, lastName, classicalRating
            FROM FidePlayers
        ) Players
          ORDER BY score, numPoints DESC, variance DESC
          LIMIT ${limit || 10}
        `,
        (error, results) => resSenderLichessToFide(error, results, res, key),
      )
  }
})

/**
 * Helper function for above query that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 * @param {pass in key for map (caching)} key
 */
 const resSenderLichessToFide = (error, results, res, key) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    myMap5.set(key, results)
    res.json({ results: results })
  }
}










// previous helper function without caching
/**
 * Helper function that sends to the client
 * @param {if an error occurred, send an error msg} error
 * @param {send the results} results
 * @param {response handler} res
 */
const resSender = (error, results, res) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    res.json({ results: results })
  }
}

module.exports = router
