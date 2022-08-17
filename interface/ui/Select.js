class UISelect extends UIElement {
	constructor(params) {
		params.tag = "select";
		super(params);
		if (params.callback) this.callback = params.callback;
		this.setOptions(params.options || [], params.selected);
		
		this.el.addEventListener('change', function(ev) {
			if (params.callback) params.callback(ev.target.value);
			ev.target.blur();
		});
	}

	update(option) {
		this.value = option;
		// callback ??
	}

	removeOption(value) {
		for (let i = 0; i < this.el.children.length; i++) {
			if (this.el.children[i].value == value)
				this.el.children[i].remove();
		}
	}

	addOption(value, selected, text) {
		const opt = document.createElement("option");
		opt.value = opt.textContent = value;
		if (selected) opt.selected = "selected";
		if (text) opt.textContent = text;
		this.el.appendChild(opt);
	}

	setOptions(options, selected) {
		for (let i = 0; i < options.length; i++) {
			const opt = Array.from(this.el.options).map(o => o.value);
			const { value, text } = typeof options[i] === 'string' ?
				{ value: options[i] }  :
				options[i];
			console.log(value, text);
			if (!opt.includes(value)) {
				this.addOption(value, selected == options[i], text);
			}
		}
	}
}