class UIButton extends UIElement {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.addClass(params.type || "btn"); /* for diff types of button */
		this.text = this.el.textContent || params.text || params.onText;
		this.callback = params.callback;
		this.arguments = params.arguments;
		this.el.addEventListener('click', this.handler.bind(this));
		if (params.key) {
			this.setKey(params.key, `${ this.el.textContent }`);
			this.el.title = `${params.key}`;
		}
	}
	
	handler() {
		this.callback(this.arguments);
	}
}
