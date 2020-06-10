const List = require('../models/list');

const listController = {
  getAllLists: async (req, res) => {
    try {
      let lists = await List.findAll({
        include: [
          {association: 'cards', include: ['tags']}
        ],
        order: [
          ['page_order', 'ASC'],
          ['cards', 'position', 'ASC']
        ]
      });
      res.json(lists);
    } catch (error) {
      res.status(500).send(error);
    }
  },

  getOneList: async (req, res) => {
    try {
      const listId = req.params.id;
      let list = await List.findByPk(listId);
      if (list) {
        res.json(list);
      } else {
        res.status(404).send('Cant find list with id '+listId);
      }
      
    } catch (error) {
      res.status(500).send(error);
    }
  },

  createList: async (req, res) => {
    try {
      console.log(req.body);
      const {name, page_order} = req.body;
      // test présence paramètres
      let bodyErrors = [];
      if (!name) {
        bodyErrors.push('name can not be empty');
      }
      if (!page_order) {
        bodyErrors.push('page_order can not be empty');
      }

      
      if (bodyErrors.length) {
        // si on a une erreur
        res.status(400).json(bodyErrors);
      } else {
        let newList = new List();
        newList.name = name;
        newList.page_order = page_order;
        await newList.save();
        res.json(newList);
      }
      
    } catch (error) {
      res.status(500).send(error);
    }
  },

  modifyList: async (req, res) => {
    try {
      const listId = req.params.id;
      let list = await List.findByPk(listId);
      if (!list) {
        res.status(404).send('Cant find list with id '+listId);
      } else {
        const {name, page_order} = req.body;
        // on ne change que les paramètres présents
        if(name) {
          list.name = name;
        }

        if (page_order) {
          list.page_order = page_order;
        }

        await list.save();

        res.json(list);
      }

    } catch (error) {
      res.status(500).send(error);
    }
  },

  createOrModify: async (req, res) => {
    try {
      const listId = req.params.id;
      let list = await List.findByPk(listId);
      if (list) {
        await listController.modifyList(req, res);
      } else {
        await listController.createList(req, res);
      }
    } catch (error) {
      res.status(500).send(error);
    }
  },

  deleteList: async (req, res) => {
    try {
      const listId = req.params.id;
      let list = await List.findByPk(listId);
      await list.destroy();
      res.json('OK');
    } catch (error) {
      res.status(500).send(error);
    }
  }
};


module.exports = listController;