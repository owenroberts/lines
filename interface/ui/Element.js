class UIElement {
	constructor(params) {
		params = params || {};

		this.el = document.getElementById(params.id) ?
				document.getElementById(params.id) :
				document.createElement(params.tag || "div");

		for (const prop in params.css) {
			this.el.style[prop] = params.css[prop];
		}

		if (params.id !== undefined) this.el.id = params.id;
		if (params.class) this.addClass(params.class); // list?

		
	}

	set text(_text) {
		this.el.textContent = _text;
	}

	set value(_value) {
		this.el.value = _value;
	}

	get value() {
		return this.el.value;
	}

	get position() {
		return { x: this.el.getBoundingClientRect().x, y: this.el.getBoundingClientRect().y };
	}

	setProp(prop, value) {
		this.el.style.setProperty(prop, value);
	}

	getProp(prop) {
		return this.el.style.getPropertyValue(prop); 
	}

	handler() {
		this.callback();
	}

	addClass(_class) {
		this.el.classList.add(_class);
	}

	removeClass(_class) {
		this.el.classList.remove(_class);
	}

	setKey(key, text) {
		this.el.title = `${text ? text : ''} ~ ${key}`;
		this.el.addEventListener('mouseenter', this.onPress.bind(this));
		this.el.addEventListener('mouseleave', this.onRelease.bind(this));
	}

	onPress(triggerRelease) {
		toolTip.text = `${this.el.title}`;
		toolTip.addClass('visible');
		this.addClass('triggered');
		if (triggerRelease === true) setTimeout(this.onRelease.bind(this), 400);
	}

	onRelease() {
		toolTip.removeClass('visible');
		this.removeClass('triggered');
	}

	remove() {
		this.el.remove();
	}
}