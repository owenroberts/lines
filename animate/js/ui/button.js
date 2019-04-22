class UIButton extends UI {
	constructor(params) {
		params.tag = "span";
		params.event = "click";
		super(params);
		this.el.classList.add("btn");
		this.el.textContent = params.title;
		this.el.addEventListener('click', this.handler.bind(this));
	}
	handler(ev) {
		if (this.arguments) this.callback(this.arguments);
		else this.callback(ev.target.value);
	}
}
