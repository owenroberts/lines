class UIColor extends UIInput {
	constructor(params) {
		super(params);
		this.el.type = "color";
		this.colors = [];



		this.el.addEventListener('input', ev => {
			const color = ev.target.value;
			this.current = color;
			this.callback(color);
		});

		this.el.addEventListener('focus', ev => {
			this.addColor(this.current);
		});

	}

	addColor(color) {
		const self = this;
		if (!this.colors.includes(color) && color) {
			this.colors.push(color);
			const btn = new UIButton({
				title: color,
				css: { "background": color },
				value: color,
				callback: function() {
					self.callback(color);
					self.setValue(color);
				}
			});
			/* not great design here ... */
			this.el.parentNode.appendChild(btn.el);
		}
	}

	update(value) {
		this.callback(value);
		this.setValue(value);
	}

	setValue(value) {
		this.addColor(value);
		super.setValue(value);
	}
}