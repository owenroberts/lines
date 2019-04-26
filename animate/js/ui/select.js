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

		/* test but don't have any select rn */
		this.el.addEventListener('change', function() {
			this.callback();
		});
	}
}