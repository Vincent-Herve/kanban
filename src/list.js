const cardModule = require('./card');

const listModule = {
  base_url: null,

  setBaseUrl: (url) => {
    listModule.base_url = url+'/lists';
  },

  showAddModal: () => {
    let modal = document.getElementById('addListModal');
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    // event.target contiendra toujours le formulaire
    let data = new FormData(event.target);
    
    // pour éviter "page_order can not be empty"
    let nbListes = document.querySelectorAll('.panel').length;
    data.set('page_order', nbListes);

    try {
      let response = await fetch(listModule.base_url, {
        method: "POST",
        body: data
      }); 
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        const list = await response.json();
        // on appelle la méthode de création avec les bons paramètres.
        let newList = listModule.makeListDOMObject(list.name, list.id);
        listModule.addListToDOM(newList);
      }
    } catch (error) {
      alert("Impossible de créer une liste");
      console.error(error);
    }
  },

  handleEditListForm: async (event) => {
    // récupérer l'id de la liste
    const listId = event.target.oid;
    //appeler l'API
    try {
      let response = await fetch(listModule.base_url+'/'+listId,{
        method: "PATCH",
        body: event.detail.formData
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let list = await response.json();
        // on met à jour le h2
        event.target.name = list.name;
      }
    } catch (error) {
      alert("Impossible de modifier la liste");
      console.error(error);
    }
  },

  makeListDOMObject: (listName, listId) => {
    // créer une nouvelle copie
    let newList = document.createElement('o-list');
    // changer les valeurs qui vont bien
    newList.name = listName;
    newList.oid = listId;
    // ajouter les event Listener !
    newList.addEventListener('save-list-name', listModule.handleEditListForm);
    newList.addEventListener('add-card', cardModule.showAddModal);
    newList.addEventListener('delete-list', listModule.deleteList);

    // on appelle le plugin SortableJS !
    /*let container = newList.querySelector('.panel-block');
    new Sortable(container, {
      group: "list",
      draggable: ".box",
      onEnd: listModule.handleDropCard
    });*/


    return newList;
  },

  addListToDOM: (newList) => {
    // insérer la nouvelle liste, juste avant le bouton "ajouter une liste"
    let lastColumn = document.getElementById('addListButton').closest('.column');
    lastColumn.before(newList);
  },

  deleteList: async (event) => {
    const listId = event.target.oid;
    // premier test, la liste est-elle vide?
    if (event.target.hasCards()) {
      alert("Impossible de supprimer une liste non vide");
      return;
    }
    // ensuite, confirmation utilisateur
    if (!confirm("Supprimer cette liste ?")) {
      return;
    }
    // on appelle l'API
    try {
      let response = await fetch(listModule.base_url+'/'+listId, {
        method: "DELETE"
      });
      if (response.ok) {
        event.target.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la liste.");
      console.log(error);
    }
  },

  updateAllCards: (cards, listId) => {
    cards.forEach( (card, position) => {
      const cardId = card.getAttribute('card-id');
      let data = new FormData();
      data.set('position', position);
      data.set('list_id', listId);
      fetch( cardModule.base_url+'/'+cardId, {
        method: "PATCH",
        body: data
      });
    });
  },

  handleDropCard: (event) => {
    let cardElement = event.item;
    let originList = event.from;
    let targetList = event.to;

    // on fait les bourrins : on va re-parcourir les 2 listes, pour mettre à jour chacune des cartes !
    let cards = originList.querySelectorAll('.box');
    let listId = originList.closest('.panel').getAttribute('list-id');
    listModule.updateAllCards(cards, listId);

    if (originList !== targetList) {
      cards = targetList.querySelectorAll('.box')
      listId = targetList.closest('.panel').getAttribute('list-id');
      listModule.updateAllCards(cards, listId);
    }
  }

};

module.exports = listModule;