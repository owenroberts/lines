class UIButton extends UI {
	constructor(params) {
		params.tag = "span";
		super(params);
		this.el.classList.add("btn");
		if (params.title) this.el.textContent = params.title;
		this.el.addEventListener('click', this.handler.bind(this));
		// this.el.addEventListener('touchend', this.handler.bind(this));
	}
	
	handler(ev) {
		ev.target.blur();
		if (this.arguments) this.callback(this.arguments);
		else this.callback(ev.target.value);
	}
}
