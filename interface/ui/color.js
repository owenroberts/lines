class UIColor extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "color";
		this.colors = [];
		this.arguments = params.arguments || [];

		this.el.addEventListener('input', ev => {
			this.setColor(ev.target.value);
		});

		this.el.addEventListener('focus', ev => {
			this.addColor(this.current);
		});
		this.palette = new UICollection();
	}

	addColor(color) {
		const self = this;
		if (!this.colors.includes(color) && color) {
			this.colors.push(color);
			const btn = new UIButton({
				text: color,
				css: { "background": color },
				value: color,
				callback: function() {
					self.callback(color, self.arguments);
					self.value = color;
				}
			});
			self.palette.append(btn);
		}
	}

	/* to set color without constantly updating "current" */
	setColor(value) {
		this.current = value;
		this.callback(...[...this.arguments, value]);
	}

	/* update for loading */
	update(value) {
		this.setColor(value);
		this.value = value;
	}

	set value(_value) {
		this.addColor(_value);
		this.current = _value;
		super.value = _value;
	}

	get value() {
		return this.el.value;
	}

	get html() {
		return [this.el, this.palette.el];
	}
}