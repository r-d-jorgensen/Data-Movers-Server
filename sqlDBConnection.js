const mysql = require('mysql');

// TODO: update rds connection to only accept from trusted ip's
const pool = mysql.createPool({
  connectionLimit : process.env.CONNECTION_LIMIT,
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE,
  port: process.env.DB_PORT,
  debug: false
});

module.exports = pool;