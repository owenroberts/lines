class UIToggleButton extends UI {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.el.classList.add("btn");
		this.el.textContent = this.on = params.on;
		this.isOn = true;
		this.off = params.off;
		this.el.addEventListener('click', function(ev) {
			this.handler(ev, this);
		}.bind(this));
	}

	handler(ev, self) {
		self.callback();
		self.toggleText();
	}

	toggleText() {
		if (this.isOn) {
			this.el.textContent = this.off;
			this.el.style.backgroundColor = "gray";
		} else {
			this.el.textContent = this.on;
			this.el.style.backgroundColor = "white";
		}
		this.isOn = !this.isOn;
	}
}
