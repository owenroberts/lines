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