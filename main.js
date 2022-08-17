require('dotenv').config({ path: '.env' });
const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(cors());

https.createServer({
	key: fs.readFileSync('cert/key.pem'),
	cert: fs.readFileSync('cert/cert.pem'),
}, app)
.listen(process.env.WEB_PORT, () => 
  console.log(`Secure server on port ${process.env.WEB_PORT}...`)
);

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

app.get('/api/', (req, res) => {
	res.send("This is a help and doc page response");
});

app.get('/api/user/login/:username/:password', (req, res) => {
  dbConnection.query("SELECT * FROM users", function (err, result, fields) {
    if (err) {
      res.status(200).json({isAuthed: false, token: null});
    };
    //console.log(req.params.username);
    res.status(200).json({isAuthed: true, token: "is authed"});
  });
});
