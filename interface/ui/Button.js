class UIButton extends UIElement {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.addClass(params.type || "btn"); /* for diff types of button */
		this.text = this.el.textContent || params.text || params.onText;
		this.callback = params.callback;
		this.args = params.args || [];
		this.el.addEventListener('click', this.keyHandler.bind(this));
		if (params.key) this.setKey(params.key, `${ this.el.textContent }`);
	}
	
	keyHandler() {
		this.callback(...this.args); 
		// buttons don' have values ... but args still confusing here ...
		// next frame -- have to know button is calling
	}
}
