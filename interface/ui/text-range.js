class UITextRange extends UICollection {
	constructor(params) {
		super(params);

		this.callback = params.callback;

		this.textInput = new UIBlur({
			// id: `${params.id}-text`, use k?
			value: params.value,
			callback: this.handler.bind(this)
		});

		this.range = new UIRange({
			// id: `${params.id}-range`, use k?
			value: params.value,
			min: params.min,
			max: params.max,
			step: params.step,
			callback: this.handler.bind(this)
		});
	}

	get elems() {
		return [this.textInput.el, this.range.el];
	}

	handler(ev, me) {
		if (typeof ev === "number") this.update(ev);
		else if (typeof ev === "string")  this.update(+ev);
		else me.update(ev.target.value || prompt(me.prompt));
		/* this is gnarly cuz ev can be event or number .... */
	}

	update(value) {
		this.callback(value);
		this.textInput.value = value;
		this.range.value = value;
	}
}