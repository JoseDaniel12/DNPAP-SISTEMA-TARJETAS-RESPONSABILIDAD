require('dotenv').config();
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true
});

conn.connect(err => {
    if (err) {
      console.log(`ERROR: MySql not connected: \n${err.stack}`);
      console.log(`Host: ${conn.host}`);
      console.log(`Port: ${conn.port}`);
      console.log(`Database: ${conn.database}`);
      console.log(`User: ${conn.user}`);
      console.log(`Password: ${conn.password}`);
      return;
    }
    console.log('> Success, MySql connected.');
});

module.exports = conn;