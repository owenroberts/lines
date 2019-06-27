class UIDisplay extends UI {
	constructor(params) {
		params.tag = "label";
		super(params);
		this.el.textContent = params.text; // value?
	}

	set(text) {
		this.el.textContent = text;
	}
}
