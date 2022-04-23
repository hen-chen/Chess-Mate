const express = require('express')
const router = express.Router()
const mysql = require('mysql')

// TODO: fill in your connection details here
const connection = mysql.createConnection({
  host: 'fluffydoge.cgutofy9jpld.us-east-1.rds.amazonaws.com',
  user: 'admin',
  password: 'meowmeow',
  port: 3306,
  database: 'Chess',
})
connection.connect()

// router.get('/path', (req, res) => {
//   res.send('hello')
// })

/* GET home page. */
// router.get('/sortFidePlayers', (req, res) => {
//   const elo = req.params.fideRating
// })

// /getGames/bob
router.get('/getGames/:id', (req, res) => {
  const { id } = req.params
  connection.query(
    `SELECT g.id  
  FROM LichessGames g, LichessPlayers p
  WHERE p.id = '${id}'
  AND (g.whiteId = p.id OR g.blackId = p.id)`,
    (error, results) => {
      if (error) {
        console.log(error)
        res.json({ error: error })
      } else if (results) {
        res.json({ results: results })
      }
    },
  )
})

module.exports = router
