class UIColor extends UI {
	constructor(params) {
		params.tag = "input";
		super(params);
		this.el.type = "color";
		this.el.style.backgroundColor = params.color;
		this.colors = [params.color];
		this.current = params.color;
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
		if (!this.colors.includes(color)) {
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
			self.el.parentNode.appendChild(btn.el);
		}
	}

	setValue(value) {
		this.addColor(value);
		super.setValue(value);
	}
}