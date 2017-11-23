class UI {
	constructor(id, event, callback) {
		this.el = document.getElementById(id);
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