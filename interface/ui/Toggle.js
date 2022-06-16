class UIToggle extends UIButton {
	constructor(params) {
		super(params);
		this.onText = params.onText || params.text;
		this.offText = params.offText || params.text;
		this.arguments = params.arguments || [];
		super.text = this.onText;
		this.isOn = true;
		if (params.isOn === false) this.toggle();
		this.addClass('toggle');
	}

	update(isOn, uiOnly) {
		if (isOn !== this.isOn) {
			if (!uiOnly) this.callback();
			this.toggle();
		}
	}

	handler() {
		this.callback(...this.arguments, this.value);
		this.toggle();
	}

	toggle() {
		if (this.isOn) this.off();
		else this.on();
		this.isOn = !this.isOn;
	}

	on() {
		this.text = this.onText;
		this.removeClass('off');
	}

	off() {
		this.text = this.offText;
		this.addClass('off');
	}

	get value() {
		return this.isOn;
	}
}
