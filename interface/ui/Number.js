class UINumber extends UIText {
	constructor(params) {
		super(params);
		this.el.classList.add('number');
		if (!this.placeholder) {
			this.placeholder = 0;
			this.el.placeholder = 0;
		}
	}

	update(value, uiOnly) {
		if (value === undefined) return;
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

		this.value = value; // always set value before callback
		if (this.callback && !uiOnly) this.callback(value);
	}

	keyHandler(value) {
		this.update(+prompt(this.prompt));
	}
}