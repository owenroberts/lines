/*
	generic ui class
	params for id, type, key (keyboard command key), event, callback, label, value, observe
	el is html element
*/
class UI {
	constructor(params) {
		this.el = document.getElementById(params.id); // attempt to find elem in html
		if (!this.el) { // if not in html create it
			if (params.type) this.el = document.createElement(params.type);
			else this.el = document.createElement("div");
			if (params.id) this.el.id = params.id;
		}
		if (params.event && params.callback)
			this.el.addEventListener(params.event, params.callback);
		if (params.observe && params.callback) {
			const observer = new MutationObserver(function(list) {
				for (var mut of list) {
					if (mut.type == "attributes" && mut.attributeName == params.observe.attribute)
						params.callback();
				}
			});
			observer.observe(params.observe.elem, { attributes: true });
		}
		if (params.callback) 
			this.callback = params.callback;
		if (params.label) 
			this.label = params.label;
		if (params.value != undefined) 
			this.el.value = params.value;
		
		/* adding key commands to panel */
		if (params.key) { 
			Lines.interface.faces[params.key] = this;
			const keyContainer = document.createElement("div");
			keyContainer.classList.add("key-container");
			const key = document.createElement("span");
			key.classList.add("key");
			if (params.key == "space")
				key.textContent = "X";
			else if (params.key.split("-").length > 1) {
				const mod = {
					"ctrl": "V",
					"alt": "A",
					"shift": "S"
				}
				key.textContent = mod[params.key.split("-")[0]] + params.key.split("-")[1]
			} else
				key.textContent = params.key;
			const dek = document.createElement("span");
			dek.textContent = params.title || params.id || params.label;
			keyContainer.appendChild(key);
			keyContainer.appendChild(dek);
			Lines.interface.panels["keys"].el.appendChild(keyContainer);
		}
	}
	addClass(clas) {
		this.el.classList.add(clas);
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
	addLabel() {
		const label = document.createElement("span");
		label.textContent = this.label;
		this.el.parentNode.insertBefore(label, this.el);
	}
	append(elem) {
		this.el.appendChild(elem);
	}
}

/*
	ui panels add ui components organized by module
*/
class Panel {
	constructor(id, label) {
		this.el = document.getElementById(id);
		if (!this.el) {
			this.el = document.createElement("div");
			this.el.id = id;
			document.getElementById("panels").appendChild(this.el);
		}
		this.el.classList.add("menu-panel");
		this.toggleBtn = document.createElement("div");
		this.toggleBtn.classList.add("panel-toggle");
		this.toggleBtn.textContent = "v";
		this.toggleBtn.addEventListener("click", this.toggle.bind(this));
		const title = document.createElement("div");
		title.textContent = label;
		title.classList.add("panel-title");
		this.el.appendChild(title);
		this.el.appendChild(this.toggleBtn);
		this.rows = [];
	}
	toggle() {
		if (this.el.clientHeight <= 25) {
			this.el.style.height = "auto";
			this.toggleBtn.innerHTML = "^";
		} else {
			this.el.style.height = 25 + "px";
			this.toggleBtn.innerHTML = "v";
		}
	}
	addRow() {
		const row = document.createElement("div");
		row.classList.add("row");
		this.el.appendChild(row);
		this.rows.push(row);
		return row;
	}
	add(component) {
		const row = this.addRow();
		row.appendChild(component.el);
		if (component.label)
			component.addLabel();
		if (component.display)
			this.rows[this.rows.length - 1].insertBefore(component.display.el, component.el);
	}
}

/*
	sub classes for specific types
*/
class UIButton extends UI {
	constructor(params) {
		params.type = "span";
		params.event = "click";
		super(params);
		this.el.classList.add("btn");
		this.el.textContent = params.title;
	}
}

class UIText extends UI {
	constructor(params) {
		params.type = "input";
		params.event = "keyup";
		super(params);
		this.el.type = "text";
		if (params.placeholder)
			this.el.placeholder = params.placeholder;
		else
			this.el.placeholder = params.title;
		if (params.blur)
			this.el.addEventListener("blur", params.callback);
	}
	reset(value) {
		this.el.value = "";
		this.el.placeholder = value;
	}
}

class UIDisplay extends UI {
	constructor(params) {
		params.type = "span";
		super(params);
		this.el.textContent = params.initial;
	}
	set(text) {
		this.el.textContent = text;
	}
}

class UIColor extends UI {
	constructor(params) {
		super(params);
		this.el.style.backgroundColor = "#" + params.color;
		this.el.classList.add("ui-color");
	}
	setColor(color) {
		this.el.style.backgroundColor = "#" + color;
	}
	/* for color gradients */
	setBkg(bkg) {
		this.el.style.backgroundImage = bkg;
	}
}

class UIRange extends UI {
	constructor(params) {
		params.type = "input";
		params.event = "input";
		super(params);
		this.el.type = "range";
		this.setRange(params.min, params.max);
		if (params.display)
			this.display = new UIDisplay({id:params.display,  initial:params.value});
		if (params.step)
			this.setStep(params.step);
	}

	setValue(value) {
		this.el.value = value;
		if (this.display)
			this.display.set(value);
		this.el.blur();
	}
	
	setRange(min, max) {
		this.el.min = min;
		this.el.max = max;	
	}

	setStep(step) {
		this.el.step = step;
	}
}

class UISelect extends UI {
	constructor(params) {
		params.type = "select";
		params.event = "change";
		super(params);
		for (let i = 0; i < params.options.length; i++) {
			const opt = document.createElement("option");
			opt.value = opt.textContent = params.options[i];
			if (opt.value == params.selected) 
				opt.selected = "selected";
			this.el.appendChild(opt);
		}
	}
}

class UIToggleButton extends UI {
	constructor(params) {
		params.type = "span";
		params.event = "click";
		super(params);
		this.el.classList.add("btn");
		this.el.textContent = this.on = params.on;
		this.isOn = true;
		this.off = params.off;
		this.el.addEventListener(params.event, this.toggleText.bind(this));
	}
	toggleText() {
		if (this.isOn) 
			this.el.textContent = this.off;
		else 
			this.el.textContent = this.on;
		this.isOn = !this.isOn;
	}
}

/* basically just for framesPanel */
class UIList {
	constructor(params) {
		this.els = document.getElementsByClassName(params.class);
	}
	getLength() {
		return this.els.length;
	}
	addClass(clas) {
		for (let i = 0; i < this.els.length; i++) {
			const elem = this.els[i];
			if (!elem.classList.contains(clas)){
 				elem.classList.add(clas);
 			}
		}
	}
	setId(id, index) {
		if (index != undefined) {
			this.els[index].setAttribute('id', id);
		}
	}
	remove(index) {
		this.els[index].remove();
	}
	looper(callback, start, end) {
		const len = end || this.els.length;
		for (let i = start || 0; i < len; i++) {
			const elem = this.els[i];
			callback(elem);
		}
	}
	append(elem) {
		this.el.appendChild(elem);
	}
}