class UINumberRange extends UICollection {
	constructor(params) {
		super(params);

		this.callback = params.callback;
		this.arguments = params.arguments || [];

		this.textInput = new UINumber({
			...params,
			callback: this.handler.bind(this)
		});

		this.range = new UIRange({
			...params,
			callback: this.handler.bind(this)
		});

		if (params.event == 'change') {
			this.range.el.addEventListener('input', ev => {
				this.textInput.el.placeholder = ev.currentTarget.value;
			});
		}
	}

	get html() {
		return [this.textInput.el, this.range.el];
	}

	handler(value, uiOnly) {
		if (!uiOnly)this.update(value !== undefined ? +value : prompt(this.prompt));
		this.value = value;
	}

	update(value, uiOnly) {
		if (!uiOnly) this.callback(...[...this.arguments, value]);
		this.value = value;
	}

	set value(value) {
		this.textInput.value = value;
		this.range.value = value;
	}

	get value() {
		return this.textInput.value;
	}
}