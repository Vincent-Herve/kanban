const Tag = require('../models/tag');
const Card = require('../models/card');

const tagController = {
  getAllTags: async (req, res) => {
    try {
      const tags = await Tag.findAll();
      res.json(tags);
    } catch (error) {
      res.status(500).json(error);
    }
  },

  createTag: async (req, res) => {
    try {
      const {title, color} = req.body;
      let bodyErrors = [];
      if (!title) {
        bodyErrors.push('title can not be empty');
      }
      if(!color) {
        bodyErrors.push('color can not be empty');
      }

      if(bodyErrors.length) {
        res.status(400).json(bodyErrors);
      } else {
        let newTag = new Tag();
        newTag.title = title;
        newTag.color = color;
        await newTag.save();
        res.json(newTag);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  modifyTag: async (req, res) => {
    try {
      const tagId = req.params.id;
      const {title, color} = req.body;

      let tag = await Tag.findByPk(tagId);
      if (!tag) {
        res.status(404).json('Can not find tag with id '+tagId);
      } else {
        if (title) {
          tag.title = title;
        }
        if (color) {
          tag.color = color;
        }
        await tag.save();
        res.json(tag);
      }

    } catch (error) {
      res.status(500).json(error);
    }
  },

  deleteTag: async (req, res) => {
    try {
      const tagId = req.params.id;
      let tag = await Tag.findByPk(tagId);
      if (!tag) {
        res.status(404).json('Can not find tag with id '+tagId);
      } else {
        await tag.destroy();
        res.json('OK');
      }
    } catch (error) {
      res.status(500).json(error);
    }
  },

  associateTagToCard: async (req, res) => {
    try {
      const cardId = req.params.id;
      const tagId = req.body.tag_id;

      let card = await Card.findByPk(cardId,{
        include: ['tags']
      });
      if(!card) {
        res.status(404).json('Can not find card with id '+cardId);
      } else {
        let tag = await Tag.findByPk(tagId);
        if (!tag) {
          res.status(404).json('Can not find tag with id '+tagId);
        } else {

          // on laisse faire la magie de Sequelize !
          await card.addTag(tag);
          // malheureusement, les associations de l'instance ne sont pas mises à jour
          // on doit donc refaire un select
          card = await Card.findByPk(cardId,{
            include: ['tags']
          });
          res.json(card);
        }
      }

    } catch (error) {
      console.log(error);
      res.status(500).send(error);
    }
  },

  removeTagFromCard: async (req, res) => {
    try {
      const {cardId, tagId} = req.params;
      let card = await Card.findByPk(cardId);
      if(!card) {
        res.status(404).json('Can not find card with id '+cardId);
      } else {
  
        let tag = await Tag.findByPk(tagId);
        if (!tag) {
          res.status(404).json('Can not find tag with id '+tagId);
        } else {
          await card.removeTag(tag);
          card = await Card.findByPk(cardId,{
            include: ['tags']
          });
          res.json(card);
        }
      }
    } catch (error) {
      res.status(500).json(error);
    }
  }
};

module.exports = tagController;