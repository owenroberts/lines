class UIText extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "text";
		this.placeholder = this.el.placeholder || params.placeholder || params.text || params.value;
		this.el.placeholder = this.placeholder;

		this.el.addEventListener('focus', ev => {
			this.el.select();
		});
		
		this.el.addEventListener('keyup', ev => {
			if (params.updateByKey) this.callback(ev.target.value);
			// this.el.style.width = ((ev.target.value.length + 1) * 8) + 'px';
		});

		/* have to hit enter to confirm value */
		this.el.addEventListener('keyup', ev => {
			if (ev.which == 13) this.update(ev.target.value);
		});

		this.el.addEventListener('blur', ev => {

			if (!this.value) {
				this.el.placeholder = this.placeholder;
				this.el.value = '';
			} else if (this.value != ev.target.value && ev.target.value) {
				// this.el.value = this.value;
				this.update(ev.target.value);
			}
		});
	}

	handler(value) {
		this.update(value !== undefined ? +value : prompt(this.prompt));
	}

	update(value, uiOnly) {

		if (typeof value === 'string') {
			if (value.match(/\D/)) {
				try {
					value = eval(value);
				} catch(e) {
					alert("Please enter a numerical value or mathematical expression.");
					return;
				}
			}
		}

		if (this.callback && !uiOnly) this.callback(value);
		this.value = value;
		// this.el.blur(); // keep going back and forth on this??
		// 11.27.2019 to prevent settings not saving when something focused
	}

	set value(_value) {
		// console.log('value', _value);
		this._value = _value;
		this.placeholder = _value;
		this.el.placeholder = _value;
		this.el.value = '';
		// this.el.blur();
	}

	get value() {
		return this._value || this.placeholder;
	}
}