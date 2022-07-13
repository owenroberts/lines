class UIToggleCheck extends UICollection {
	constructor(params) {
		super(params);
		this.callback = params.callback;

		this.check = new UIElement({
			tag: 'input',
			text: params.text,
			class: 'toggle-check',

		});
		this.check.el.type = 'checkbox';
		this.check.el.addEventListener('change', ev => {
			if (this.callback) this.callback(ev.target.checked);
		});

		this.label = new UIElement({ tag: 'label' });
		this.label.text = params.text;

	}

	get html() {
		return [this.label.el, this.check.el];
	}

	get value() {
		return this.check.el.checked;
	}

	keyHandler(value) {
		this.update(value !== undefined ? value : !this.value);
	}

	update(value) {
		this.check.el.checked = value;
		if (this.callback) this.callback(value);
	}

	
}