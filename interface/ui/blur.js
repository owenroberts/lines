class UIBlur extends UIText {
	constructor(params) {
		super(params);

		this.el.onblur = ev => {
			if (ev.target.value) this.handler(ev, this);
		};
		
		this.value = params.value;
	}

	set value(_value) {
		if (_value !== undefined) this.el.placeholder = _value;
		this.el.value = '';
	}

	get value() {
		return this.el.value || this.el.placeholder;
	}

}