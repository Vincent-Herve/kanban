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