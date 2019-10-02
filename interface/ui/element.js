class UIElement {
	constructor(params) {
		params = params || {};

		this.el = document.getElementById(params.id) ?
				document.getElementById(params.id) :
				document.createElement(params.tag || "div");

		for (const prop in params.css) {
			this.el.style[prop] = params.css[prop];
		}

		// if (params.id) this.el.id = params.id;

		
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
		this.el.addEventListener('mouseenter', this.onPress.bind(this));
		this.el.addEventListener('mouseleave', this.onRelease.bind(this));
	}

	onPress(triggerRelease) {
		toolTip.textContent = `~ ${this.el.title}`;
		toolTip.classList.add('visible');
		if (triggerRelease) setTimeout(this.onRelease.bind(this), 400);
	}

	onRelease() {
		const toolTip = document.getElementById('tool-tip');
		toolTip.textContent = `~ ${this.el.title}`;
		toolTip.classList.remove('visible');
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


}