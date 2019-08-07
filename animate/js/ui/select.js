class UISelect extends UI {
	constructor(params) {
		params.tag = "select";
		super(params);
		for (let i = 0; i < params.options.length; i++) {
			const opt = document.createElement("option");
			opt.value = opt.textContent = params.options[i];
			if (opt.value == params.selected) 
				opt.selected = "selected";
			this.el.appendChild(opt);
		}

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
			});
		}
	}
}