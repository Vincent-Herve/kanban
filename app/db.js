const sequelize = require('sequelize');

const dbConnection = new sequelize.Sequelize(process.env.PGSQL_URL);

module.exports = dbConnection;