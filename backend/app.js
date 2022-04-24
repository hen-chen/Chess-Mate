const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const complexRouter = require('./routes/complexQueries')

const app = express()

// app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }));

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', indexRouter)
app.use('/', complexRouter)
app.use('/users', usersRouter)

module.exports = app
