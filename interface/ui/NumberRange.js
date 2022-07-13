class UINumberRange extends UICollection {
	constructor(params) {
		super(params);

		this.callback = params.callback;
		this.args = params.args || [];

		this.numberInput = new UINumber({
			...params,
			callback: this.update.bind(this)
		});

		this.range = new UIRange({
			...params,
			callback: this.update.bind(this)
		});

		if (params.event === 'change') {
			this.range.el.addEventListener('input', ev => {
				this.numberInput.el.placeholder = ev.currentTarget.value;
			});
		}

		if (params.value !== undefined) this.value = params.value;
	}

	get html() {
		return [this.numberInput.el, this.range.el];
	}

	keyHandler(value, isKeyEvent) {
		this.update(+prompt(this.prompt));
	}

	update(value, uiOnly) {
		if (!uiOnly) this.callback(value, ...this.args);
		this.value = value;
	}

	set value(value) {
		this.numberInput.value = value;
		this.range.value = value;
	}

	get value() {
		return this.numberInput.value;
	}
}