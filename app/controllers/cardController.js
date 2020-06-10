const List = require('../models/list');
const Card = require('../models/card');

const cardController = {
  getCardsInList: async (req, res) => {
    try {
      const listId = req.params.id;
      const list = await List.findByPk(listId, {
        include: [{
          association: 'cards',
          include: ['tags']
        }]
      });

      if (!list) {
        res.status(404).json(`Cant find list with id ${listId}`);
      } else {
        res.json(list.cards);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  getOneCard: async (req, res) => {
    try {
      const cardId = req.params.id;
      const card = await Card.findByPk(cardId,{
        include: ['tags']
      });
      if (!card) {
        res.status(404).json(`Cant find card with id ${cardId}`);
      } else {
        res.json(card);
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  createCard: async (req, res) => {
    try {
      const {title, color, list_id} = req.body;

      let bodyErrors = [];
      if (!title) {
        bodyErrors.push(`title can not be empty`);
      }
      if (!list_id) {
        bodyErrors.push(`list_id can not be empty`);
      }

      if (bodyErrors.length) {
        res.status(400).json(bodyErrors);
      } else {
        let newCard = new Card();
        newCard.title = title;
        newCard.list_id = list_id;
        if (color) {
          newCard.color = color;
        }
        await newCard.save();
        res.json(newCard);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  modifyCard: async (req, res) => {
    try {
      const cardId = req.params.id;
      const {title, color, list_id, position} = req.body;

      // on inclue les tags pour pouvoir les renvoyer à la fin de l'update
      let card = await Card.findByPk(cardId,{
        include: ['tags']
      });
      if (!card) {
        res.status(404).json(`Cant find card with id ${cardId}`);
      } else {
        // on ne change que les paramètres envoyés
        if (title) {
          card.title = title;
        }
        if (list_id) {
          card.list_id = list_id;
        }
        if (color) {
          card.color = color;
        }
        if (position) {
          card.position = position;
        }
        await card.save();
        res.json(card);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  deleteCard: async (req, res) => {
    try {
      const cardId = req.params.id;
      let card = await Card.findByPk(cardId);
      if (!card) {
        res.status(404).json(`Cant find card with id ${cardId}`);
      } else {
        await card.destroy();
        res.json('ok');
      }

    } catch (error) {
      res.status(500).json(error);
    }
  }
};


module.exports = cardController;