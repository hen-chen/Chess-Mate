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

app.post('/users/login', async (req, res) => {
  const { username, password } = req.body
  const result = await lib.login(db, username, password)

  if (!result) {
    res.send('Username or password incorrect')
  } else {
    res.send('Success: login')
  }
})

app.listen(process.env.PORT || 8000, async () => {
  try {
    db = await lib.connect(url)
    await db.collection('Users').remove({})
    await db
      .collection('Users')
      .insertOne({ username: 'Alice', password: 'hi' })
    console.log('connected to MongoDB')
  } catch (error) {
    console.log('could not connect to MongoDB')
  }
})

module.exports = app
