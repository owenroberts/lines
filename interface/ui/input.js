class UIInput extends UIElement {
	constructor(params) {
		params.tag = "input";
		super(params);
		this.callback = params.callback;
		this.arguments = params.arguments;
		if (params.key) this.setKey(params.key, params.label);
	}
}