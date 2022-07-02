class UINumberDrag extends UICollection {
	constructor(params) {
		super(params);
		this.callback = params.callback;
		this.stepAmount = params.stepAmount || 1;
		// constrain range

		this.numberInput = new UINumber({
			...params,
			class: 'middle',
			callback: this.update.bind(this)
		});

		this.stepDown = new UIButton({
			text: '<',
			class: 'left-end',
			callback: () => {
				this.update(this.value - this.stepAmount);
			}
		});

		this.stepUp = new UIButton({
			text: '>',
			class: 'right-end',
			callback: () => {
				this.update(this.value + this.stepAmount);
			}
		});

	}

	update(value, uiOnly) {
		if (!uiOnly) this.callback(value);
		this.value = value;
	}

	get html() {
		return [this.stepDown.el, this.numberInput.el, this.stepUp.el];
	}

	set value(value) {
		this.numberInput.value = value;
	}

	get value() {
		return this.numberInput.value;
	}
}