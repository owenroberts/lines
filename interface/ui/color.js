class UIColor extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "color";
		this.colors = [];
		this.arguments = params.arguments;

		this.el.addEventListener('input', ev => {
			this.current = ev.target.value;
			this.callback(ev.target.value, this.arguments);
		});

		this.el.addEventListener('focus', ev => {
			this.addColor(this.current);
		});

		this.palette = new UICollection();
	}

	addColor(color) {
		const self = this;
		console.log(this.palette);
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

	update(value) {
		this.callback(value, this.arguments);
		this.value = value;
	}

	set value(_value) {
		this.addColor(_value);
		this.current = _value;
		super.value = _value;
	}

	get elems() {
		return [this.el, this.palette.el];
	}
}