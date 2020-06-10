const Sequelize = require('sequelize');
const db = require('../db');

const Card = require('./card');

class List extends Sequelize.Model {

};

List.init({
  name: Sequelize.TEXT,
  page_order: Sequelize.INTEGER
}, {
  sequelize: db,
  tableName: "list"
});

// Associations
List.hasMany(Card, {
  as: 'cards',
  foreignKey: 'list_id'
});

Card.belongsTo(List, {
  as: 'list',
  foreignKey: 'list_id'
});

module.exports = List;