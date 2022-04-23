const express = require('express')
const router = express.Router()
const mysql = require('mysql')

const config = require('../config.json')

// TODO: fill in your connection details here
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

const resSender = (error, results, res) => {
  if (error) {
    console.log(error)
    res.json({ error: error })
  } else if (results) {
    res.json({ results: results })
  }
}

module.exports = router
