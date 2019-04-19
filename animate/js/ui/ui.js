class UI {
	constructor(params) {
		var self = this;
		this.el = document.getElementById(params.id); // attempt to find elem in html
		if (!this.el) { // if not in html create it
			if (params.type) this.el = document.createElement(params.type);
			else this.el = document.createElement("div");
			if (params.id) this.el.id = params.id;
		}

		// callback ? 

		if (params.callback) this.callback = params.callback;
		if (params.label) this.label = params.label;
		if (params.value != undefined) 
			this.el.value = params.value;

		if (params.key) this.setKey(params.key);
		if (params.observe && params.callback) {
			const observer = new MutationObserver(function(list) {
				for (var mut of list) {
					if (mut.type == "attributes" && mut.attributeName == params.observe.attribute)
						params.callback();
				}
			});
			observer.observe(params.observe.elem, { attributes: true });
		}
	}

	setKey(key) {
		this.el.title = key; // hover title key text
		if (Lines.interface) Lines.interface.keyCommands[key] = this;
	}
	
	addClass(c) {
		this.el.classList.add(c);
	}
	
	setId(id) {
		this.el.id = id;
	}
	
	setValue(value) {
		this.el.value = value;
	}
	
	getValue() {
		return this.el.value;
	}
	
	addLabel(key) {
		const label = document.createElement("span");
		label.textContent = this.label;
		if (this.el.title) label.title = this.el.title;
		this.el.parentNode.insertBefore(label, this.el);
	}
	
	append(elem) {
		this.el.appendChild(elem);
	}
}