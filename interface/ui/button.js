class UIButton extends UIElement {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.addClass(params.class || "btn");

		
		this.setTextContent(this.el.textContent || params.title); /* ugly */

		this.callback = params.callback;
		
		/* most btns dont have args, handler for args from key press */
		this.arguments = params.arguments;
		this.el.addEventListener('click', this.handler.bind(this));
		
		if (params.key) this.setKey(params.key, `${ this.el.textContent }`);
		/* slightly different from input key ... */
	}
	
	// remove ??
	handler() {
		this.callback(this.arguments); // not needed?
	}
}
