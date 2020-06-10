const Sequelize = require('sequelize');
const db = require('../db');

const Tag = require('./tag');

class Card extends Sequelize.Model {

};

Card.init({
  title: Sequelize.TEXT,
  color: Sequelize.TEXT,
  list_id: Sequelize.INTEGER,
  position: Sequelize.INTEGER
}, {
  sequelize: db,
  tableName: "card"
});


/** Associations */

Card.belongsToMany(Tag, {
  as: 'tags',
  through: 'card_has_tag',
  foreignKey: 'card_id',
  otherKey: 'tag_id',
  timestamps: false
});

module.exports = Card;