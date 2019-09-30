class UIBlur extends UIText {
	constructor(params) {
		super(params);
		this.el.addEventListener("blur", ev => {
			if (ev.target.value) this.handler(ev, this);
		});
		this.setValue(params.value);
	}

	setValue(value) {
		if (value !== undefined) this.el.placeholder = value;
		this.el.value = '';
		// this.el.blur();
	}

	getValue() {
		return this.el.value || this.el.placeholder;
	}

}