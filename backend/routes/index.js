const express = require('express')
const router = express.Router()
const mysql = require('mysql')
const _ = require('lodash')

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

// Get player by lichess id
router.get('/player/lichess/:id', (req, res) => {
  const { id } = req.params
  connection.query(
    `SELECT * FROM LichessPlayers WHERE id=${connection.escape(id)}`,
    (error, results) => {
      if (results && results.length > 0) {
        res.send(results[0])
      } else {
        res.send({ error })
      }
    },
  )
})

// Get player by fide id
router.get('/player/fide/:id', (req, res) => {
  const { id } = req.params
  connection.query(
    `SELECT * FROM FidePlayers WHERE id=${connection.escape(id)}`,
    (error, results) => {
      if (results && results.length > 0) {
        res.send(results[0])
      } else {
        res.send({ error })
      }
    },
  )
})

// Get player histories end points
// Returns data as { "bullet": [year/month/val], "blitz": [year/month/val], ... }
// Only lichess has bullet
const getRatingHistory = (type, res, id) => {
  tableName = type === 'lichess' ? 'LichessHistory' : 'FideHistory'
  idType = type === 'lichess' ? 'lichessId' : 'fideId'
  connection.query(
    `SELECT * FROM ${tableName} WHERE ${idType}=${connection.escape(
      id,
    )} ORDER BY year, month`,
    (error, results) => {
      if (results) {
        const groupedResults = _(results)
          .groupBy('type')
          .mapValues((dataPoints) => {
            return dataPoints.map((point) => {
              const { year, month, rating } = point
              return { year, month, rating }
            })
          })
        res.send(groupedResults)
      } else {
        res.send({ error })
      }
    },
  )
}

router.get('/history/lichess/:id', (req, res) => {
  const { id } = req.params
  getRatingHistory('lichess', res, id)
})

router.get('/history/fide/:id', (req, res) => {
  const { id } = req.params
  getRatingHistory('fide', res, id)
})

/**
 * Sort Fide players by world rank in ascending order given country, returning the first and last names of the players.
 * @param country e.g. US for United States
 */
router.get('/sortFidePlayers/:country', (req, res) => {
  const { country } = req.params
  connection.query(
    `SELECT firstName, lastName, worldRankAllPlayers
  FROM FidePlayers
  WHERE country = '${country}'
  ORDER BY worldRankAllPlayers;`,
    (error, results) => resSender(error, results, res),
  )
})

/**
 * Lichess
 * Given user, find all the game ids that the user `id` played
 * @param id user id
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
 * @param year e.g. 2011
 * @param type type of Fide Game (e.g. classical, rapid, blitz)
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
 * Fide
 * Find all information about a Fide player given their id
 * @param id e.g. 5202213
 */
router.get('/getFidePlayerInfo/:id', (req, res) => {
  const { id } = req.params
  connection.query(
    `SELECT *
    FROM FidePlayers
    WHERE id = "${id}";
    `,
    (error, results) => resSender(error, results, res),
  )
})

// ================== Used in Search ==================

router.get('/players', (req, res) => {
  const { p } = req.query
  connection.query(
    `SELECT *
    FROM LichessPlayers
    WHERE LOWER(username) LIKE LOWER('${p}')
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
