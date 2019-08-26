class UISelect extends UI {
	constructor(params) {
		params.tag = "select";
		super(params);
		
		this.setOptions(params.options, params.select);

		if (params.label) this.addLabel(params.label);

		if (params.btn) {
			const select = this;
			const btn = new UIButton({
				id: `${this.title || this.id}-btn`,
				title: params.btn,
				callback: function() {
					params.callback(select.getValue());
				}
			});
			this.el.parentNode.appendChild(btn.el);
		} else {
			this.el.addEventListener('change', function(ev) {
				params.callback(ev.target.value);
				ev.target.blur();
			});
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