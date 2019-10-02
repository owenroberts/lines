class UIInput extends UIElement {
	constructor(params) {
		params.tag = "input";
		super(params);
		this.callback = params.callback;
		if (params.key) this.setKey(params.key, params.label);
	}
}