class UI {
	constructor(id, event, callback) {
		this.el = document.getElementById(id);
		if (event && callback)
			this.el.addEventListener(event, callback);
		if (callback) this.callback = callback;
	}

	addClass(clas) {
		this.el.classList.add(clas);
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