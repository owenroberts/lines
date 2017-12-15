class UI {
	constructor(id, event, callback, type, key) {
		/* this may be useless if all are created ... */
		this.el = document.getElementById(id);
		if (!this.el) {
			if (type) this.el = document.createElement(type);
			else this.el = document.createElement("div");
			this.el.id = id;
		}
		this.listen(event, callback);
		if (key) Lines.interface.interfaces[key] = this;
	}

	listen(event, callback) {
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
	constructor(id) {
		this.el = document.createElement("div");
		this.el.id = id;
		this.el.classList.add("menu-panel");
		this.toggleBtn = document.createElement("div");
		this.toggleBtn.classList.add("panel-toggle");
		this.toggleBtn.textContent = "v";
		this.toggleBtn.addEventListener("click", this.toggle.bind(this));
		const title = document.createElement("div");
		title.textContent = capitalize(id);
		this.el.appendChild(this.toggleBtn);
		this.el.appendChild(title);
		document.getElementById("panels").appendChild(this.el);
		this.rows = [];
		this.addRow();
	}
	toggle() {
		if (this.el.clientHeight <= 25) {
			this.el.style.height = "auto";
			this.el.style.flex = "2 50%";
			this.toggleBtn.innerHTML = "^";
		} else {
			this.el.style.height = 25 + "px";
			this.el.style.flex = "1 25%";
			this.toggleBtn.innerHTML = "v";
		}
	}
	addRow() {
		const row = document.createElement("row");
		row.classList.add("row");
		this.el.appendChild(row);
		this.rows.push(row);
	}
	add(component) {
		this.rows[this.rows.length - 1].appendChild(component.el);
		if (component.label) {
			component.addLabel();
		}
	}
}

class UIButton extends UI {
	constructor(id, title, event, callback, key) {
		super(id, event, callback, "span", key);
		this.el.classList.add("btn");
		this.el.textContent = title;
	}
}

class UIText extends UI {
	constructor(id, title, event, callback) {
		super(id, event, callback, "input");
		this.el.type = "text";
		this.el.placeholder = title;
	}
}

class UIDisplay extends UI {
	set(text) {
		this.el.textContent = text;
	}
}

class UIRange extends UI {
	constructor(id, event, label, callback) {
		super(id, event, callback, "input");
		this.el.type = "range";
		this.label = label;
	}
	addLabel() {
		const label = document.createElement("span");
		label.textContent = this.label;
		this.el.parentNode.insertBefore(label, this.el);
	}
	setRange(min, max) {
		this.el.min = min;
		this.el.max = max;	
	}
	setValue(value) {
		this.el.value = value;
	}
	getValue(other) {
		other = this.el.value;
	}
}

class UIInput extends UI {
	setValue(value) {
		this.el.value = value;
	}
}

class UIToggleButton extends UI {
	constructor(id, event, callback, key, on, off) {
		super(id, event, callback, "span", key);
		this.el.classList.add("btn");
		this.el.textContent = on;
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

