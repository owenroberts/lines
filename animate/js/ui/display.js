class UIDisplay extends UI {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.el.textContent = params.initial; // value?
	}
	
	set(text) {
		this.el.textContent = text;
	}
}