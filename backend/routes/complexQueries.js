const express = require('express')
const router = express.Router()
const mysql = require('mysql')

// private connection credentials to connect to our database
const config = require('../config.json')

// connection
const connection = mysql.createConnection({
  host: config.rds_host,
  user: config.rds_user,
  password: config.rds_password,
  port: config.rds_port,
  database: config.rds_db,
})
connection.connect()

/**
 * Find all top level games (where the sum of both players’ elo is >= 3000). Find all the players in these games, and get all the players’ countries. Then find all the users in these countries. Sort the users by country and elo.
 * @param elo the total sum elo (e.g. 4000)
 */
router.get('/topGamesCountryPlayers/:elo', (req, res) => {
  const { elo } = req.params
  connection.query(
    `WITH top_games AS (
    SELECT *
    FROM 
    (
      SELECT whiteId, blackId, whiteRating, blackRating, (whiteRating + blackRating) AS sum_elo
      FROM LichessGames
    ) SummedElo
    WHERE SummedElo.sum_elo >= ${elo}
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
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Find some poor level games (sum of elo is < 2400), and determine all the players’ playtime. Find all the unverified players with elo less than `elo` (with similar playtime). Sort the users by playtime, elo.
 * @param elo fideRating less than this elo
 */
router.get('/poorPlayers/:elo', (req, res) => {
  const { elo } = req.params
  connection.query(
    `WITH poor_games AS (
      SELECT *
      FROM
      (
        SELECT whiteId, blackId, whiteRating, blackRating, (whiteRating + blackRating) AS sum_elo
        FROM LichessGames
      ) SummedElo
      WHERE SummedElo.sum_elo <= 2400
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
    (error, results) => resSender(error, results, res),
  )
})

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
