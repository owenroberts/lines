class UIRange extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "range";
		this.setRange(params.min, params.max);
		this.value = params.value || params.min;
		if (params.step) this.setStep(params.step);

		this.el.addEventListener(params.event || 'input', ev => {
			this.handler(ev, this);
		});
	}

	handler(ev, me) {
		me.update(ev.type == 'keydown' ? prompt(me.prompt) : +ev.target.value);
	}

	update(value) {
		this.el.value = value;
		this.el.blur();
		this.callback(value, this.arguments);
	}

	setRange(min, max) {
		this.el.min = min;
		this.el.max = max;	
	}

	setStep(step) {
		this.el.step = step;
	}
}