require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');
const mysql = require('./util/mysql.js');
const { jwtTokenMaker } = require('./util/jwtTokenMaker.js');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());
app.listen(process.env.PORT || 4000, () => 
  console.log(`Secure server on port ${process.env.WEB_PORT || 4000}...`) // TODO: logging
);

process.on('uncaughtException', err => {
  console.error('There was an uncaught error', err); // TODO: logging
  process.exit(1); // mandatory (as per the Node.js docs)
});

// TODO: Implement Logging instead of pushing everything to console
// TODO: DB Calls should be moved to thier own section
//check if DB is connected and working
(async () => {
  const connection = await mysql.connection();
  try {
    const check = await connection.query("SELECT 1 + 1 AS solution");
    if (check[0].solution === 2) console.log("Connected to Database"); // TODO: logging
    else throw new Error("Error with DB Connection");
  } catch (err) {
    console.log(err); // TODO: logging
  } finally {
    await connection.release();
  }
})();

app.get('/', (res) => res.status(200).send("This is a help and doc page response") );

// return user auth if match
app.get('/user/login/:username/:password', async (req, res) => {
  const connection = await mysql.connection();
  try {
    const query = "SELECT * FROM users WHERE username = ? AND user_password = ?";
    const userAuth = await connection.query(query, [req.params.username, req.params.password]);
    if (userAuth[0]) {
      res.status(200).json({
        isAuthed: true,
        token: jwtTokenMaker(),
        user_id: userAuth[0].user_id,
        user_type_ENUM_id: userAuth[0].user_type_ENUM_id,
        error: null
      });
      return;
    } else throw new Error("Incorrect Username or Password");
  } catch (err) {
    res.status(200).json({isAuthed: false, token: null, error: err});
    console.log(err); // TODO: logging
  } finally {
    await connection.release();
  }
});

// sign up new user
app.get('/user/newUser/:username/:password/:email', async (req, res) => {
  const connection = await mysql.connection();
  try {
    // check if username already exists
    const checkUsernameQuery = "SELECT COUNT (*) FROM users WHERE username = ?";
    const userNameCheck = await connection.query(checkUsernameQuery, [req.params.username]);
    if (userNameCheck[0]["COUNT (*)"] > 0) throw new Error("Username is already in use");

    // insert new user and return auth
    const newUserQuery = "INSERT INTO users (username, user_password, email, user_type_ENUM_id) VALUES (?, ?, ?, 3)";
    const newUserAuth = await connection.query(newUserQuery, [req.params.username, req.params.password, req.params.email]);
    console.log(newUserAuth)
    if (newUserAuth[0]) {
      res.status(200).json({
        isAuthed: true,
        token: "is authed",
        user_id: newUserAuth[0].insertId,
        user_type_ENUM_id: 3,
        error: null
      });
    } else throw new Error("Sever had problems with you sign up try again latter");

  } catch (err) {
    res.status(200).json({isAuthed: false, token: null, error: err});
    console.log(err); // TODO: logging
  } finally {
    await connection.release()
  }
});
