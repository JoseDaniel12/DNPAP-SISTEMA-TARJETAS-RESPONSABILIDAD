const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    'dnpap', 
    'usuario',
    'contraseña', {
    host: 'localhost',
    dialect: 'mysql',
});

async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Conexión a MySql exitosa.');
  } catch (error) {
    console.error('Error al conectar a la base de datos:', error);
  }
}