class UITextRange extends UICollection {
	constructor(params) {
		super(params);

		this.callback = params.callback;

		this.text = new UIBlur({
			id: `${params.id}-text`,
			value: params.value,
			callback: this.handler.bind(this)
		});

		this.range = new UIRange({
			id: `${params.id}-range`,
			value: params.value,
			min: params.min,
			max: params.max,
			callback: this.handler.bind(this)
		});

	}

	getElem() {
		return [this.text.el, this.range.el];
	}

	handler(ev, me) {
		if (typeof ev === "number") this.update(ev);
		else if (typeof ev === "string")  this.update(+ev);
		else me.update(ev.target.value || prompt(me.prompt));
		/* this is gnarly cuz ev can be event or number .... */
	}

	update(value) {
		this.callback(value);
		this.text.setValue(value);
		this.range.setValue(value);
	}
}