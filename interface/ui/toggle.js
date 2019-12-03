class UIToggle extends UIButton {
	constructor(params) {
		super(params);
		this.onText = params.onText || params.text;
		this.offText = params.offText || params.text;
		super.text = this.onText;
		this.isOn = true;
		if (params.isOn === false) this.toggle();
	}

	update(isOn) {
		console.log(isOn);
		if (!isOn) {
			this.callback();
			this.toggle();
		}
	}

	handler() {
		this.callback();
		this.toggle();
	}

	toggle() {
		if (this.isOn) this.off();
		else  this.on();
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
}
