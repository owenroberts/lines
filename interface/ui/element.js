class UIElement {
	constructor(params) {
		params = params || {}; 
		this.el = document.getElementById(params.id) ?
				document.getElementById(params.id) :
				document.createElement(params.tag || "div");

		for (const prop in params.css) {
			this.el.style[prop] = params.css[prop];
		}

		// id ? 
	}

	handler() {
		this.callback();
	}

	getElem() {
		return this.el;
	}

	setValue(value) {
		this.el.value = value;
	}

	getValue() {
		return this.el.value;
	}

	setKey(key, text) {
		this.el.title = `${text ? text : ''} (${key})`; // hover title key text
	}

	addClass(_class) {
		this.el.classList.add(_class);
	}

	removeClass(_class) {
		this.el.classList.remove(_class);
	}

	setTextContent(text) {
		this.el.textContent = text;
	}

	setId(id) {
		this.el.id = id;
	}	

	press() {
		/* tool tip ... what about for key commands with no elements?  is that a thing ... ? */
		this.addClass('press');
		setTimeout(function() {
			this.removeClass('press');
		}.bind(this), 300);
	}
}