(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
class CardElement extends HTMLElement {

    set title(value) {
        this._titleElement.textContent = this._titleForm.elements.title.value = value;
    }

    set color(value) {
        this.style.backgroundColor = 
        this._titleForm.elements.color.value = value;
    }

    set oid(value) {
        this.dataset.oid = this._oid = value;
    }

    get oid() {
        return this._oid;
    }

    constructor() {
        super();

        const shadowRoot = this.attachShadow({mode: 'open'});
        let template = document.getElementById('template-card').content;
        shadowRoot.innerHTML = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">';
        shadowRoot.appendChild(template.cloneNode(true));

        this._titleElement = shadowRoot.querySelector('.card-name');
        this._titleForm = shadowRoot.querySelector('form');
        this._editButton = shadowRoot.querySelector('.button--edit-card');
        this._deleteButton = shadowRoot.querySelector('.button--delete-card');
        this._addTagButton =  shadowRoot.querySelector('.button--add-tag');

        this.addListeners();
    }

    connectedCallback() {
        this.className = this.shadowRoot.querySelector('div.box').className;
        this.shadowRoot.querySelector('div.box').className = '';
    }

    addListeners() {
        this._editButton.addEventListener('click', this.toggleTitleMode.bind(this));
        this._titleForm.addEventListener('submit', this.saveCard.bind(this));
        this._deleteButton.addEventListener('click', this.deleteSelf.bind(this));
        this._addTagButton.addEventListener('click', this.linkTags.bind(this));
    }

    toggleTitleMode() {
        this._titleElement.classList.toggle('is-hidden');
        this._titleForm.classList.toggle('is-hidden');
    }

    deleteSelf() {
        this.dispatchEvent(new CustomEvent('delete-card'));
    }

    linkTags() {
        this.dispatchEvent(new CustomEvent('link-tags'));
    }

    saveCard(event) {
        event.preventDefault();

        const saveEvent = new CustomEvent('save-card', { detail: {
            formData: new FormData(this._titleForm)
        }});

        this.dispatchEvent(saveEvent);

        this.toggleTitleMode();
    }
}

customElements.define('o-card', CardElement);
},{}],2:[function(require,module,exports){
class ListElement extends HTMLElement {

    set name(value) {
        this._nameElement.textContent = this._nameForm.elements.name.value = value;
    }

    set oid(value) {
        // permet de donner un moyen "facile" de cibler l'élément à partir de son id
        this.dataset.oid = this._oid = value;
    }

    get oid() {
        // du coup, faut aussi pouvoir accéder à l'info
        return this._oid;
    }

    hasCards() {
        return !!this.children.length;
    }

    // appelé en premier, avec une bonne longueur d'avance
    constructor() {
        // la syntaxe class nous permet d'utiliser les mots-clés associés :-)
        super();
        // et d'être presque certain que this désignera toujours le bon objet

        // le shadow root cache toute la structure "interne" du CE
        const shadowRoot = this.attachShadow({mode: 'open'});
        let template = document.getElementById('template-list').content;
        shadowRoot.innerHTML = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">';
        shadowRoot.appendChild(template.cloneNode(true));

        // pour accéder facilement aux élément clés, on va quand même les "retenir"
        // càd en faire des propriétés
        // par convention, on met des _ devant, ce qui signifie qu'on est pas censés y accéder depuis l'extérieur
        // mais ce n'est qu'une convention, ça n'empêche pas vraiment l'accès
        this._nameElement = shadowRoot.querySelector('h2');
        this._nameForm = shadowRoot.querySelector('form');
        this._addCardButton = shadowRoot.querySelector('.button--add-card');
        this._deleteButton = shadowRoot.querySelector('.button--delete-list');

        this.addListeners();
    }

    // appelé quand l'élément est connecté au DOM pour la première fois
    // la plupart des manipulations DOM devrait avoir lieu ici ;-)
    connectedCallback() {
        // pour que l'affichage soit correct et que la liste se comporte comme un .column enfant de .columns
        // on récupère les classes de l'élément de plus haut niveau pour les appliquer plutôt au custom element
        this.className = this.shadowRoot.querySelector('div.panel').className;
        this.shadowRoot.querySelector('div.panel').className = '';
    }

    addListeners() {
        this._nameElement.addEventListener('dblclick', this.toggleNameMode.bind(this));
        this._nameForm.addEventListener('submit', this.saveName.bind(this));
        this._addCardButton.addEventListener('click', this.addCard.bind(this));
        this._deleteButton.addEventListener('click', this.deleteSelf.bind(this));
    }

    toggleNameMode() {
        this._nameElement.classList.toggle('is-hidden');
        this._nameForm.classList.toggle('is-hidden');
    }

    addCard() {
        this.dispatchEvent(new CustomEvent('add-card'));
    }

    deleteSelf() {
        this.dispatchEvent(new CustomEvent('delete-list'));
    }

    saveName(event) {
        // attention, le callback n'étant pas appelé par l'objet lui-même (sinon, ça serait pas un callback)
        // il ne faut pas oublier de lier l'objet courant à this au moment de l'ajout de listener
        event.preventDefault();

        const saveEvent = new CustomEvent('save-list-name', { detail: {
            formData: new FormData(this._nameForm)
        }});

        this.dispatchEvent(saveEvent);

        this.toggleNameMode();
    }
}

customElements.define('o-list', ListElement);
},{}],3:[function(require,module,exports){
// on importe les autres modules !
const listModule = require('./list');
const cardModule = require('./card');
const tagModule = require('./tag');
require('./ListElement');
require('./CardElement');


// on objet qui contient des fonctions
var app = {
  // l'url "de base" de notre api !
  base_url: "http://localhost:5050",

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    listModule.setBaseUrl(app.base_url);
    cardModule.setBaseUrl(app.base_url);
    tagModule.setBaseUrl(app.base_url);

    //console.log('app.init !');
    app.addListenerToActions();

    // chargement depuis l'API
    app.getListsFromAPI();
  
  },

  // ajoute les écouteurs aux boutons statiques et aux formulaires
  addListenerToActions: () => {
    // bouton "ajouter une liste"
    let addListButton = document.getElementById('addListButton');
    addListButton.addEventListener('click', listModule.showAddModal );

    // boutons "fermer les modales"
    let closeModalButtons = document.querySelectorAll('.close');
    for (let button of closeModalButtons) {
      button.addEventListener('click', app.hideModals);
    }

    // formulaire "ajouter une liste"
    let addListForm = document.querySelector('#addListModal form');
    addListForm.addEventListener('submit', app.handleAddListForm);

    // boutons "ajouter une carte" => plus besoin, les écouteur sont créés directement dans le module

    // formulaire "ajouter une carte"
    let addCardForm = document.querySelector('#addCardModal form');
    addCardForm.addEventListener('submit', app.handleAddCardForm);

    // modale "gérer les tags"
    document.getElementById('editTagsButton').addEventListener('click', tagModule.showEditModal);

    // formulaire "nouveau tag"
    document.getElementById('newTagForm').addEventListener('submit', tagModule.handleNewTag);
  },

  // cache toutes les modales
  hideModals: () => {
    let modals = document.querySelectorAll('.modal');
    for (let modal of modals) {
      modal.classList.remove('is-active');
    }
  },

  // action formulaire : ajouter une liste
  handleAddListForm: async (event) => {
    event.preventDefault();
    await listModule.handleAddFormSubmit(event);
    // on ferme les modales !
    app.hideModals();
  },

  // action formulaire : ajouter une carte
  handleAddCardForm: async (event) => {
    // on empeche le rechargement de la page
    event.preventDefault();
    
    await cardModule.handleAddFormSubmit(event);

    // et on ferme les modales !
    app.hideModals();
  },

  /** Fonctions de récupération des données */
  getListsFromAPI: async () => {
    try {
      let response = await fetch(app.base_url+"/lists");
      // on teste le code HTTP
      if (response.status !== 200) {
        // si pas 200 => problème.
        // on récupère le corps de la réponse, et on le "throw" => il tombera dans le catch jsute après
        let error = await response.json();
        throw error;
      } else {
        // si tout c'est bien passé : on passe à la création des listes dans le DOM
        let lists = await response.json();
        // console.log(lists);
        for (let list of lists) {
          let listElement = listModule.makeListDOMObject(list.name, list.id);
          listModule.addListToDOM(listElement);

          // on a modifié la route de l'api pour inclure directement les cartes !
          for (let card of list.cards) {
            let cardElement = cardModule.makeCardDOMObject(card.title, card.id, card.color);
            cardModule.addCardToDOM(cardElement, list.id);

            // et on continue : on ajout les tags !
            for (let tag of card.tags) {
              let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, card.id);
              tagModule.addTagToDOM(tagElement, card.id);
            }
          }
        }
      }
    } catch (error) {
      // en cas d'erreur, on affiche un message à l'utilisateur
      alert("Impossible de charger les listes depuis l'API.");
      // et on log l'erreur en console pour plus de détails
      console.error(error);
    }
  }
  
};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );
},{"./CardElement":1,"./ListElement":2,"./card":4,"./list":5,"./tag":6}],4:[function(require,module,exports){
const tagModule = require('./tag');

const cardModule = {
  base_url: null,

  setBaseUrl: (url) => {
    cardModule.base_url = url+'/cards';
  },

  showAddModal: (event) => {
    const listId = event.target.oid;
    
    let modal = document.getElementById('addCardModal');
    // on récupère l'input 
    let input = modal.querySelector('input[name="list_id"]');
    // on change sa valeur
    input.value = listId;
    // on a plus qu'à afficher la modale
    modal.classList.add('is-active');
  },

  handleAddFormSubmit: async (event) => {
    // on récupère les infos dur form
    let data = new FormData(event.target);

    try {
      let response = await fetch(cardModule.base_url,{
        method: "POST",
        body: data
      });
      if (response.status != 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        // et on les passe à la bonne méthode
        let newCardElement = cardModule.makeCardDOMObject(card.title, card.id, card.color);
        cardModule.addCardToDOM(newCardElement, card.list_id);
      }
    } catch (error) {
      alert("Impossible de créer une carte");
      console.error(error);
    }
  },

  handleEditCardForm: async (event) => {
    // récupérer l'id de la liste
    const cardId = event.target.oid;
    //appeler l'API
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "PATCH",
        body: event.detail.formData
      });
      if (response.status !== 200) {
        let error = await response.json();
        throw error;
      } else {
        let card = await response.json();
        // on met à jour le h2
        event.target.title = card.title;
        // et la couleur
        event.target.color = card.color;
      }
    } catch (error) {
      alert("Impossible de modifier la carte");
      console.error(error);
    }
  },

  makeCardDOMObject: (cardTitle, cardId, cardColor) => {
    // créer une nouvelle copie
    let newCard = document.createElement('o-card');
    // changer les valeurs qui vont bien
    newCard.title = cardTitle;
    newCard.oid = cardId;
    newCard.color = cardColor;
    // ajouter les eventListener
    newCard.addEventListener('save-card', cardModule.handleEditCardForm);
    newCard.addEventListener('delete-card', cardModule.deleteCard);
    newCard.addEventListener('link-tags', tagModule.showAssociateModal);

    return newCard;
  },

  addCardToDOM: (newCard, listId) => {
    // insérer la nouvelle carte dans la bonne liste
    let theGoodList = document.querySelector(`o-list[data-oid="${listId}"]`);
    theGoodList.appendChild(newCard);
  },

  deleteCard: async (event) => {
    // confirmation utilisateur
    if (!confirm("Supprimer cette carte ?")) {
      return;
    }
    const cardId = event.target.oid;
    try {
      let response = await fetch(cardModule.base_url+'/'+cardId,{
        method: "DELETE"
      });
      if (response.ok) {
        event.target.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer la carte");
      console.error(error);
    }
  }

};

// pour bundliser, il faut qu'on exporte !
module.exports = cardModule;
},{"./tag":6}],5:[function(require,module,exports){
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
},{"./card":4}],6:[function(require,module,exports){
const tagModule = {
  base_url: null,

  setBaseUrl: (url) => {
    tagModule.base_url = url;
  },

  makeTagDOMObject: (tagTitle, tagColor, tagId, cardId) => {
    let newTag = document.createElement('div');
    newTag.classList.add('tag');
    newTag.style.backgroundColor = tagColor;
    newTag.textContent = tagTitle;
    newTag.setAttribute('tag-id', tagId);
    newTag.setAttribute('card-id', cardId);

    newTag.addEventListener('dblclick', tagModule.disassociateTag);

    return newTag;
  },

  addTagToDOM: (tagElement, cardId) => {
    let cardTagsElement = document.querySelector(`o-card[data-oid="${cardId}"]`);
    cardTagsElement.appendChild(tagElement);
  },

  showAssociateModal: async (event) => {
    const cardId = event.target.oid;
    const modal = document.getElementById('associateTagModal');
    // on appelle l'api pour avoir la liste des Tags
    try {
      let response = await fetch(tagModule.base_url+'/tags');
      if (response.ok) {
        let tags = await response.json();
        let container = document.createElement('section');
        container.classList.add('modal-card-body');
        for (let tag of tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, cardId);
          tagElement.addEventListener('click', tagModule.handleAssociateTag);

          container.appendChild(tagElement);
        }
        modal.querySelector('.modal-card-body').replaceWith(container);
        modal.classList.add("is-active");

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }  

  },

  handleAssociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let data = new FormData();
      data.set('tag_id', tagId);
      let response = await fetch(tagModule.base_url+`/cards/${cardId}/tags`, {
        method: "POST",
        body: data
      });
      if (response.ok) {
        // on recrée tous les tags de la carte, pour s'assurer "facilement" de pas créer de doublons
        let card = await response.json();
        // 1 : supprimer les "vieux" tags 
        let oldTags = document.querySelectorAll(`o-card[data-oid="${card.id}"] .tag`);
        for (let tag of oldTags) {
          tag.remove();
        }
        // 2 : créer les nouveaux!
        let container = document.querySelector(`o-card[data-oid="${card.id}"]`);
        for (let tag of card.tags) {
          let tagElement = tagModule.makeTagDOMObject(tag.title, tag.color, tag.id, card.id);
          container.appendChild(tagElement);
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible d'associer le tag");
      console.error(error);
    }
    const modal = document.getElementById('associateTagModal');
    modal.classList.remove('is-active');
  },

  disassociateTag: async (event) => {
    const tagId = event.target.getAttribute('tag-id');
    const cardId = event.target.getAttribute('card-id');
    try {
      let response = await fetch(tagModule.base_url+`/cards/${cardId}/tags/${tagId}`,{
        method: "DELETE"
      });
      if (response.ok) {
        // on a rien à faire, sauf supprimer le tag !
        event.target.remove();
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de désassocier le tag'),
      console.error(error);
    }
  },

  makeEditTagForm: (tag) => {
    let orignalForm = document.getElementById('newTagForm');
    let newForm = document.importNode(orignalForm, true);
    // on enlève l'id
    newForm.setAttribute('id', null);
    // on ajoute une classe
    newForm.classList.add('editTagForm');
    // on regle les input
    newForm.querySelector('[name="title"]').value = tag.title;
    newForm.querySelector('[name="color"]').value = tag.color;
    // on rajoute un attribut pour l'id du tag
    newForm.setAttribute('tag-id', tag.id);
    // et un event listener pour le submit
    newForm.addEventListener('submit', tagModule.handleEditTag);
    // on rajoute un bouton "supprimer"
    let deleteButton = document.createElement('div');
    deleteButton.classList.add("button", "is-small", "is-danger");
    deleteButton.textContent = "Supprimer";
    deleteButton.addEventListener('click', tagModule.handleDeleteTag);

    newForm.querySelector(".field").appendChild(deleteButton);

    return newForm;
  },

  showEditModal: async () => {
    // on récupère les tags depuis l'API
    try {
      let response = await fetch(tagModule.base_url+'/tags');
      if (response.ok) {
        const modal = document.getElementById('addAndEditTagModal');

        let tags = await response.json();
        let container = document.createElement('div');
        container.classList.add('editTagForms');
        for (let tag of tags) {
          let editFormElement = tagModule.makeEditTagForm(tag);
          container.appendChild(editFormElement);
        }
        modal.querySelector('.editTagForms').replaceWith(container);
        
        modal.classList.add('is-active');
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de récupérer les tags");
      console.error(error);
    }
  },

  handleNewTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);
    try {
      let response = await fetch(tagModule.base_url+'/tags',{
        method: "POST",
        body: data
      });
      if (response.ok) {
        // ba rien! y'a rien à faire.
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de créer le tag");
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleEditTag: async (event) => {
    event.preventDefault();
    let data = new FormData(event.target);

    let tagId = event.target.getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url+'/tags/'+tagId,{
        method: "PATCH",
        body: data
      });
      if (response.ok) {
        let tag = await response.json();
        // on récupère toutes les occurences existantes du tag
        let existingOccurences = document.querySelectorAll(`[tag-id="${tag.id}"]`);
        for (let occurence of existingOccurences) {
          // et on les met à jour
          occurence.textContent = tag.title;
          occurence.style.backgroundColor = tag.color;
        }

      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert('Impossible de mettre le tag à jour');
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  },

  handleDeleteTag: async (event) => {
    const tagId = event.target.closest('form').getAttribute('tag-id');
    try {
      let response = await fetch(tagModule.base_url+'/tags/'+tagId, {
        method: "DELETE"
      });
      if (response.ok) {
        // on récupère toutes les occurences du tag
        let existingOccurences = document.querySelectorAll(`[tag-id="${tagId}"]`);
        // et on les supprime !
        for (let occurence of existingOccurences) {
          occurence.remove();
        }
      } else {
        let error = await response.json();
        throw error;
      }
    } catch (error) {
      alert("Impossible de supprimer le tag");
      console.error(error);
    }
    // on ferme la modale
    document.getElementById('addAndEditTagModal').classList.remove('is-active');
  }
};

module.exports = tagModule;
},{}]},{},[3]);
