const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')

const indexRouter = require('./routes/index')
const complexRouter = require('./routes/complexQueries')

// mongo
const lib = require('./dbOperations')

let db

const url =
  'mongodb+srv://Henry:O6bac7Cmpbfcx7u4@cluster0.y9ta9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

const app = express()

app.use(cors({ credentials: true, origin: true }))

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/', complexRouter)

// ========== Users ==========

/**
 * Registers the user in the database
 */
app.post('/users/signup', async (req, res) => {
  console.log(req.body)
  const { username, password } = req.body
  const result = await lib.addUser(db, username, password)

  if (result.message) {
    res.send('User already exists')
  } else {
    res.send('Success: User created')
  }
})

/**
 * Checks if the user exists and logs them in.
 */
app.post('/users/login', async (req, res) => {
  const { username, password } = req.body
  const result = await lib.login(db, username, password)

  if (!result) {
    res.send('Username or password incorrect')
  } else {
    res.send('Success: login')
  }
})

/**
 * get the liked users given a user
 */
app.get('/users/liked/:loggedUser', async (req, res) => {
  const { loggedUser } = req.params
  const result = await lib.getLikedPlayers(db, loggedUser)

  if (!result) {
    res.send('Error: could not get liked user')
  } else {
    res.status(200).json({ result })
  }
})

/**
 * put and delete a liked user
 */
app.put('/users/liked/:loggedUser/:username', async (req, res) => {
  const { loggedUser, username } = req.params
  await lib.putLikePlayer(db, loggedUser, username)
  res.send('Success: added liked player')
})

app.delete('/users/liked/:loggedUser/:username', async (req, res) => {
  const { loggedUser, username } = req.params
  await lib.deleteLikePlayer(db, loggedUser, username)
  res.send('Success: deleted liked player')
})

// END ROUTES

const port = process.env.PORT || 45555

// Listening
app.listen(port, async () => {
  try {
    db = await lib.connect(url)
    console.log(`Connected to MongoDB on port ${port}`)
  } catch (error) {
    console.log(error)
    console.log('could not connect to MongoDB')
  }
})

module.exports = app
