require('dotenv').config({ path: '.env' });
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());


app.listen(process.env.PORT || 4000, () => 
  console.log(`Secure server on port ${process.env.WEB_PORT || 4000}...`)
);

// TODO: update rds connection to only accept from trusted ip's
// TODO: update to using a connection pool to limit problems
const dbConnection = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	port: process.env.DB_PORT,
	database: process.env.DB_DATABASE,
});

// TODO: May need to open and close the connection for each call
dbConnection.connect((err) => {
	if (err) {
		console.error("Database connection failed:\n" + err.stack);
		return;
	}
	console.log("Connected to database.");
});

app.get('/', (req, res) => {
	res.send("This is a help and doc page response");
});

// return user auth if match
app.get('/user/login/:username/:password', (req, res) => { 
  const query = "SELECT * FROM users WHERE username = ? AND user_password = ?";
  dbConnection.query(query, [req.params.username, req.params.password], function (err, result) {
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
  dbConnection.query(checkUsernameQuery, [req.params.username, req.params.password], function (err, result) {
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
      dbConnection.query(newUserQuery, [req.params.username, req.params.password, req.params.email], function (err, result) {
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
