class UI {
	constructor(id, event, callback) {
		this.el = document.getElementById(id);
		if (!this.el) {
			this.el = document.createElement("span");
			this.el.classList.add("btn");
			this.el.id = id;
			this.el.textContent = id;
		}
		/* should this be button specific? */
		if (event && callback)
			this.el.addEventListener(event, callback);
		if (callback) this.callback = callback;
	}

	addClass(clas) {
		this.el.classList.add(clas);
	}

	setId(id) {
		this.el.id = id;
	}
}

function capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
/* does this extend UI? */
class Panel {
	constructor(id, finterace) {
		this.el = document.createElement("div");
		this.el.id = id;
		this.el.classList.add("menu-panel");
		const toggle = document.createElement("div");
		toggle.classList.add("panel-toggle");
		toggle.textContent = "v";
		toggle.addEventListener("click", finterace.togglePanel);
		const title = document.createElement("div");
		title.textContent = capitalize(id);
		this.el.appendChild(toggle);
		this.el.appendChild(title);
		document.getElementById("panels").appendChild(this.el);
		this.rows = [];
		this.addRow();
	}
	addRow() {
		const row = document.createElement("row");
		row.classList.add("row");
		this.el.appendChild(row);
		this.rows.push(row);
	}
	add(component) {
		this.rows[this.rows.length - 1].appendChild(component.el);
	}
}



class UIText extends UI {
	constructor(id, event, callback) {
		super(id);
		this.el = document.createElement("input");
		this.el.type = "text";
		this.el.id = id;
		this.el.placeholder = id;
		/* this is dumb ... */
		if (event && callback)
			this.el.addEventListener(event, callback);
		if (callback) this.callback = callback;
	}
}

class UIDisplay extends UI {
	set(text) {
		this.el.textContent = text;
	}
}

class UIRange extends UI {
	setRange(min, max) {
		this.el.min = min;
		this.el.max = max;	
	}
}

class UIInput extends UI {
	setValue(value) {
		this.el.value = value;
	}
}

class UIToggleButton extends UI {
	constructor(id, event, callback, on, off) {
		super(id, event, callback);
		this.isOn = true;
		this.on = on;
		this.off = off;
		this.el.addEventListener(event, this.toggleText.bind(this));
	}
	toggleText() {
		if (this.isOn) this.el.textContent = this.off;
		else this.el.textContent = this.on;
		this.isOn = !this.isOn;
	}
}

/* for classes, not useful right now */
class UIList {
	constructor(clas) {
		this.els = document.getElementsByClassName(clas);
	}
	getLength() {
		return this.els.length;
	}
	setId(id, index) {
		if (index != undefined) {
			this.els[index].setAttribute('id', id);
			/* this is saving a "current" key in the array object for some reason... */
		}
	}
	remove(index) {
		this.els[index].remove();
	}
}

