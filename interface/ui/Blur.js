class UIBlur extends UIText {
	constructor(params) {
		super(params);

		this.el.addEventListener('blur', ev => {
			if (ev.target.value) this.handler(ev.target.value);
		});

		this.value = params.value;
	}

	set value(_value) {
		if (this.arguments) {
			if (this.arguments['segmentNum']) {
				console.trace();
				console.log(_value);
			}
		}
		if (_value !== undefined) this.el.placeholder = _value;
		this.el.value = '';
		
		// blur?
		this.el.blur();
	}

	get value() {
		return this.el.value || this.el.placeholder;
	}

}