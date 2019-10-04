class UIText extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "text";
		this.el.placeholder = this.el.placeholder || params.placeholder || params.value;

		this.el.addEventListener('focus', ev => {
			this.el.select();
		});

		this.el.addEventListener('keyup', ev => {
			if (ev.which == 13) this.update(ev.target.value);
		});
	}

	handler(ev, me) {
		me.update(ev.target.value || prompt(me.prompt));
	}

	update(value) {
		this.callback(value);
		this.value = value;
	}

	set value(_value) {
		this.el.value = this.el.placeholder = _value;
		this.el.blur();
	}
}