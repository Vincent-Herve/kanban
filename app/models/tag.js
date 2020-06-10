const Sequelize = require('sequelize');
const db = require('../db');

class Tag extends Sequelize.Model {

};

Tag.init({
  title: Sequelize.TEXT,
  color: Sequelize.TEXT,
}, {
  sequelize: db,
  tableName: "tag"
});

module.exports = Tag;