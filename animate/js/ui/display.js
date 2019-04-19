class UIDisplay extends UI {
	constructor(params) {
		params.type = "span";
		super(params);
		this.el.textContent = params.initial;
	}
	set(text) {
		this.el.textContent = text;
	}
}