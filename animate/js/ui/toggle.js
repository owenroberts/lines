class UIToggleButton extends UI {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.el.classList.add("btn");
		this.el.textContent = this.on = params.on;
		this.isOn = true;
		this.off = params.off;
		if (params.isOn === false) this.toggle();
		this.el.addEventListener('click', function(ev) {
			this.handler(ev, this);
		}.bind(this));
	}

	handler(ev, self) {
		console.log(ev);
		self.callback();
		self.toggle();
	}

	toggleOn() {
		this.el.textContent = this.on;
		this.el.style.backgroundColor = "lightgray";
	}

	toggleOff() {
		this.el.textContent = this.off;
		this.el.style.backgroundColor = "gray";
	}

	toggle() {
		if (this.isOn) this.toggleOff();
		else  this.toggleOn();
		this.isOn = !this.isOn;
	}
}
