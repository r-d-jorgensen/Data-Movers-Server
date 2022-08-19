require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const pool = require('./sqlDBConnection.js');
const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

app.listen(process.env.PORT || 4000, () => 
  console.log(`Secure server on port ${process.env.WEB_PORT || 4000}...`)
);

// check connection to DB
try {
  pool.query('SELECT 1 + 1 AS solution', (error, results) => {
    if (error) {
      console.log("Bad database Connection");
      throw error;
    }else if (results[0].solution === 2) console.log("Connected to database...");
    else console.log("Something went wrong with database connection");
  });
} catch {
  console.log(error);
}

app.get('/', (res) => {
	res.send("This is a help and doc page response");
});

// return user auth if match
app.get('/user/login/:username/:password', (req, res) => { 
  const query = "SELECT * FROM users WHERE username = ? AND user_password = ?";
  pool.query(query, [req.params.username, req.params.password], function (err, result) {
    if (err) {
      res.status(200).json({isAuthed: false, token: "", error: "Server Error"});
      throw err;
    }
    if (result[0]) {
      res.status(200).json({
        isAuthed: true,
        token: "is authed",
        user_id: result[0].user_id,
        user_type_ENUM_id: result[0].user_type_ENUM_id
      });
      return;
    }
    res.status(200).json({isAuthed: false, token: "", error: "Incorrect Username or Password"});
  });
});

// sign up new user
app.get('/user/newUser/:username/:password/:email', (req, res) => {
  // check if username already exists
  const checkUsernameQuery = "SELECT * FROM users WHERE username = ?";
  pool.query(checkUsernameQuery, [req.params.username, req.params.password], function (err, result) {
    if (err) {
      res.status(200).json({isAuthed: false, token: "", error: "Server Error"});
      throw err;
    }
    if (result[0]) {
      res.status(200).json({isAuthed: false, token: "", error: "Username is already in use"});
    } else {
      // TODO: fix the nesting of these queries
      // insert new user and return user auth
      const newUserQuery = "INSERT INTO users (username, user_password, email, user_type_ENUM_id) VALUES (?, ?, ?, 3)";
      pool.query(newUserQuery, [req.params.username, req.params.password, req.params.email], function (err, result) {
        if (err) {
          res.status(200).json({isAuthed: false, token: "", error: "Server Error"});
          throw err;
        }
        res.status(200).json({
          isAuthed: true,
          token: "is authed",
          user_id: result.insertId,
          user_type_ENUM_id: 3
        });
      });
    }
  });
});
