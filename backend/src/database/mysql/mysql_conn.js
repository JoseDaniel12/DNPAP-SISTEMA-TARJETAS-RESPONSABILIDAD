// require('dotenv').config();
const mysql = require('mysql2');

const conn = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  decimalNumbers: true,
  multipleStatements: true,
  enableKeepAlive: true,
});


conn.connect(err => {
  if (err) {
    console.log(`ERROR: MySql not connected: \n${err.stack}`);
    console.log(`Host: ${process.env.MYSQL_HOST}`);
    console.log(`Port: ${process.env.MYSQL_PORT}`);
    console.log(`Database: ${process.env.MYSQL_DATABASE}`);
    console.log(`User: ${process.env.MYSQL_USER}`);
    console.log(`Password: ${process.env.MYSQL_PASSWORD}`);
    return;
  }
  console.log('> Success, MySql connected.');
});


module.exports = conn;
