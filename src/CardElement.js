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