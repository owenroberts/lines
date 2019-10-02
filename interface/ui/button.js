class UIButton extends UIElement {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.addClass(params.class || "btn");

		this.setTextContent(this.el.textContent || params.title || params.onText); /* ugly */
		

		this.callback = params.callback;
		
		this.arguments = params.arguments;
		this.el.addEventListener('click', this.handler.bind(this));
		
		if (params.key) this.setKey(params.key, `${ this.el.textContent }`);
	}
	
	handler() {
		this.callback(this.arguments);
	}
}
