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
		console.log(color);
		if (!this.colors.includes(color)) {
			this.colors.push(color);
			console.log(this, this.callback);
			const btn = new UIButton({
				title: color,
				css: { "background": color },
				value: color,
				callback: this.callback
			});
			console.log(this.parentNode);
			lns.ui.panels.lineColor.add(btn);
		}
	}
}