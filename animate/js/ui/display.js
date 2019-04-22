class UIDisplay extends UI {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.el.textContent = params.initial;
	}
	set(text) {
		this.el.textContent = text;
	}
}