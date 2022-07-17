class UIToggleCheck extends UICollection {
	constructor(params) {
		super(params);
		this.callback = params.callback;
		this.addClass('ui-collection');

		this.check = new UIElement({
			tag: 'input',
			text: params.text,
			class: 'toggle-check',

		});
		this.check.el.type = 'checkbox';
		this.check.el.checked = params.isOn || false;
		this.check.el.addEventListener('change', ev => {
			if (this.callback) this.callback(ev.target.checked);
			this.check.el.blur();
		});

		this.label = new UIElement({ tag: 'label' });
		this.label.text = params.text;

		this.el.appendChild(this.label.el);
		this.el.appendChild(this.check.el);

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