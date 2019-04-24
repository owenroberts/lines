class UIColor extends UI {
	constructor(params) {
		params.tag = "input";
		super(params);
		this.el.type = "color";
		this.el.style.backgroundColor = params.color;
		this.el.addEventListener('input', ev => {
			this.callback(ev.target.value);
		});
	}
}