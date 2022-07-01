class UINumberDrag extends UICollection {
	constructor(params) {
		super(params);
		this.callback = params.callback;

		this.numberInput = new UINumber({
			...params,
			class: 'middle',
			callback: this.update.bind(this)
		});

		this.stepDown = new UIButton({
			text: '<',
			class: 'left-end',
			callback: function() {
				this.update(this.value - 1);
			}
		});

		this.stepUp = new UIButton({
			text: '>',
			class: 'right-end',
			callback: function() {
				this.update(this.value + 1);
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