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
 * Sort Fide players in the US by world rank in ascending order, returning the first and last names of the players.
 */
router.get('/sortFidePlayers', (_req, res) => {
  connection.query(
    `SELECT firstName, lastName, worldRankAllPlayers
  FROM FidePlayers
  WHERE country = 'US'
  ORDER BY worldRankAllPlayers;`,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Given user, find all the game ids that the user `id` played
 */
router.get('/getGames/:id', (req, res) => {
  const { id } = req.params
  connection.query(
    `SELECT g.id  
  FROM LichessGames g, LichessPlayers p
  WHERE p.id = '${id}'
  AND (g.whiteId = p.id OR g.blackId = p.id)`,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Lichess
 * Return the ids, bullet rating, blitz rating, rapid rating, and classical rating of Lichess       * players, ensuring that the Lichess players returned have existing ratings for these fields
 */
router.get('/playerRatings', (_req, res) => {
  connection.query(
    `SELECT id, bulletRating, blitzRating, rapidRating, classicalRating
  FROM LichessPlayers
  WHERE bulletRating IS NOT NULL
  AND blitzRating IS NOT NULL
  AND rapidRating IS NOT NULL
  AND classicalRating IS NOT NULL;
  `,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Lichess
 * Given a title (e.g. GM), find all players with that title sorted by classicalRating
 * @param title
 */
router.get('/sortTitle/:title', (req, res) => {
  const { title } = req.params
  connection.query(
    `SELECT id, username, firstName, lastName, country, classicalRating
    FROM LichessPlayers
    WHERE title = '${title}' AND classicalRating IS NOT NULL
    ORDER BY classicalRating DESC;
    `,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Lichess
 * Given a type of game, find the top 100 players that play that type and sort by their Rating
 * @param type the type of game (e.g. fide, uscf, ecf, bullet, blitz, rapid, classical)
 */
router.get('/sortByTypeRating/:type', (req, res) => {
  const { type } = req.params
  connection.query(
    `
    SELECT id, username, country, ${type}Rating
    FROM LichessPlayers
    WHERE ${type}Rating IS NOT NULL
    ORDER BY ${type}Rating DESC
    LIMIT 100;
    `,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Fide
 * Find all Fide Player id and all their classical ratings in `year``, returning the player id,     year, rating, and type
 * @param year
 * @param type - type of Fide Game
 */
router.get('/getRatingsInYear/:year/:type', (req, res) => {
  const { year, type } = req.params
  connection.query(
    `SELECT p.id, h.year, h.rating, h.type
    FROM FidePlayers p JOIN FideHistory h ON p.id = h.fideId
    WHERE h.year = ${year} AND type = '${type}'
    ORDER BY h.rating DESC;
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
