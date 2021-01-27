class UIText extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "text";
		this.placeholder = this.el.placeholder || params.placeholder || params.text || params.value;
		this.el.placeholder = this.placeholder;

		this.el.addEventListener('focus', ev => {
			this.el.select();
		});

		if (params.updateByKey) {
			this.el.addEventListener('keyup', ev => {
				this.callback(ev.target.value);
			});
		}

		/* have to hit enter to confirm value */
		this.el.addEventListener('keyup', ev => {
			if (ev.which == 13) this.update(ev.target.value);
		});

		this.el.addEventListener('blur', ev => {
			if (!this.value) {
				this.el.placeholder = this.placeholder;
				this.el.value = '';
			} else if (this.value != ev.target.value) {
				this.el.value = this.value;
			}
		});
	}

	handler(value) {
		this.update(value !== undefined ? +value : prompt(this.prompt));
	}

	update(value) {
		if (this.callback) this.callback(value);
		this.value = value;
		// this.el.blur(); // keep going back and forth on this??
		// 11.27.2019 to prevent settings not saving when something focused
	}

	set value(_value) {
		// console.log('value', _value);
		// this.el.value = this.el.placeholder = _value;
		this._value = _value;
		this.el.value = _value;
		this.el.placeholder = _value;
		this.el.blur();
	}

	get value() {
		return this._value;
	}
}