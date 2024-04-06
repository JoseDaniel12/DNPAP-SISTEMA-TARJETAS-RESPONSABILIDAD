// require('dotenv').config();
const mysql = require('mysql2/promise');

const createNewMysqlConnection = async () => {
  const connSettings = {
    host: process.env.MYSQL_HOST,
    port: process.env.MYSQL_PORT,
    database: process.env.MYSQL_DATABASE,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    decimalNumbers: true,
    multipleStatements: true,
    enableKeepAlive: true
  };

  try {
    const connection = await mysql.createConnection(connSettings);
    return connection;
  } catch (error) {
    console.log(`ERROR: MySql not connected: \n${error.stack}`);
    console.log(`Host: ${connSettings.host}`);
    console.log(`Port: ${connSettings.port}`);
    console.log(`Database: ${connSettings.database}`);
    console.log(`User: ${connSettings.user}`);
    console.log(`Password: ${connSettings.password}`);
    return null;
  }
};


let mysqlConnection = null;
const getMysqlConnection = async () => {
  // Check to see if connection exists and is not in the "closing" state
  if (!mysqlConnection || mysqlConnection?.connection?._closing) {
    mysqlConnection = await createNewMysqlConnection();
  }
  return mysqlConnection;
};


module.exports = {
  getMysqlConnection
};
