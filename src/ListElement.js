class ListElement extends HTMLElement {

    set name(value) {
        this._nameElement.textContent = this._nameForm.elements.name.value = value;
    }

    set oid(value) {
        this.dataset.oid = this._oid = value;
    }

    get oid() {
        
        return this._oid;
    }

    hasCards() {
        return !!this.children.length;
    }


    constructor() {

        super();
      
        const shadowRoot = this.attachShadow({mode: 'open'});
        let template = document.getElementById('template-list').content;
        shadowRoot.innerHTML = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.7.2/css/bulma.min.css">';
        shadowRoot.appendChild(template.cloneNode(true));

        this._nameElement = shadowRoot.querySelector('h2');
        this._nameForm = shadowRoot.querySelector('form');
        this._addCardButton = shadowRoot.querySelector('.button--add-card');
        this._deleteButton = shadowRoot.querySelector('.button--delete-list');

        this.addListeners();
    }

    connectedCallback() {
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
        
        event.preventDefault();

        const saveEvent = new CustomEvent('save-list-name', { detail: {
            formData: new FormData(this._nameForm)
        }});

        this.dispatchEvent(saveEvent);

        this.toggleNameMode();
    }
}

customElements.define('o-list', ListElement);