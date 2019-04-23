class UIRange extends UI {
	constructor(params) {
		params.tag = "input";
		params.event = "input";
		super(params);
		this.el.type = "range";
		this.setRange(params.min, params.max);
		if (params.step) this.setStep(params.step);

		if (params.input) {
			this.input = new UIText({
				id: params.display, 
				value: params.value,
				label: params.label,
				placeholder: params.value,
				blur: true,
				callback: this.update.bind(this)
			});
			this.input.addClass('display');
		}

		if (params.display) {
			this.display = new UIDisplay({
				id:params.display,  
				initial:params.value
			});
		}

		if (params.event) {
			this.el.addEventListener(params.event, ev => {
				this.handler(ev, this);
			});
		}
	}

	handler(ev, ui) {
		let val;
		if (ev.type == 'keydown') val = prompt(ui.prompt);
		else val = +ev.target.value;
		ui.update(val);
	}

	update(value) {
		this.el.value = value;
		this.el.blur();
		if (this.display) this.display.set(value);
		if (this.input) this.input.set(value);
		if (this.toggleText) this.toggleText();
		this.callback(value);
	}

	setRange(min, max) {
		this.el.min = min;
		this.el.max = max;	
	}

	setStep(step) {
		this.el.step = step;
	}
}