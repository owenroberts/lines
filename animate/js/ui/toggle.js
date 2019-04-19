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
