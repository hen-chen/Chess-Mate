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
    return await db
      .collection('Users')
      .insertOne({ username, password, liked: [] })
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

const getLikedPlayers = async (db, loggedUser) => {
  try {
    const likedPlayers = await db
      .collection('Users')
      .findOne({ username: loggedUser }, { projection: { liked: 1, _id: 0 }});

    return likedPlayers ? likedPlayers.liked : null;
  } catch (e) {
    console.log('Could not get liked players')
  }
}

const putLikePlayer = async (db, loggedUser, username) => {
  try {
    return await db.collection('Users').update({ username: loggedUser }, { $push: { 'liked': username }});
  } catch (e) {
    console.log('Could not put like player');
  }
}

const deleteLikePlayer = async (db, loggedUser, username) => {
  try {
    return await db.collection('Users').update({ username: loggedUser }, { $pull: { 'liked': username }});
  } catch (e) {
    console.log('Could not put like player');
  }
}

// TODO delete player

module.exports = {
  connect,
  addUser,
  login,
  getLikedPlayers,
  putLikePlayer,
  deleteLikePlayer,
}
