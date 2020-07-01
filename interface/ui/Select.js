class UISelect extends UIElement {
	constructor(params) {
		params.tag = "select";
		super(params);
		this.setOptions(params.options || [], params.selected);
		
		this.el.addEventListener('change', function(ev) {
			if (params.callback) params.callback(ev.target.value);
			ev.target.blur();
		});
	}

	removeOption(value) {
		for (let i = 0; i < this.el.children.length; i++) {
			if (this.el.children[i].value == value)
				this.el.children[i].remove();
		}
	}

	addOption(value, selected) {
		const opt = document.createElement("option");
		opt.value = opt.textContent = value;
		if (selected) opt.selected = "selected";
		this.el.appendChild(opt);
	}

	setOptions(options, selected) {
		for (let i = 0; i < options.length; i++) {
			const opt = Array.from(this.el.options).map(o => o.value);
			if (!opt.includes(options[i]))
				this.addOption(options[i], selected == options[i]);
		}
	}
}