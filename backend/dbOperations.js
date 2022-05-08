const { MongoClient } = require('mongodb')

const connect = async (url) => {
  try {
    const conn = (
      await MongoClient.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
    ).db()
    console.log(`Connected to the database: ${conn.databaseName}`)
    return conn
  } catch (err) {
    console.error(err)
    throw new Error('could not connect to the db')
  }
}

const addUser = async (db, username, password) => {
  try {
    const userExists = await db.collection('Users').findOne({ username })
    if (userExists !== null) {
      return { message: 'user already exists' }
    }
    return await db.collection('Users').insertOne({ username, password })
  } catch (e) {
    console.log('Could not create user')
  }
}

const login = async (db, username, password) => {
  try {
    const userExists = await db
      .collection('Users')
      .findOne({ username, password })
    if (userExists !== null) {
      return { message: 'User found' }
    }
    return null
  } catch (e) {
    console.log('Could not create user')
  }
}

module.exports = {
  connect,
  addUser,
  login,
}
