class UIText extends UI {
	constructor(params) {
		params.type = "input";
		params.event = "keyup";
		super(params);
		this.el.type = "text";
		if (params.placeholder) this.el.placeholder = params.placeholder;
		else this.el.placeholder = params.title;
		
		if (params.blur) {
			this.el.addEventListener("blur", ev => {
				params.callback(+ev.target.value);
			});
		}

		this.el.addEventListener('keyup', ev => {
			if (ev.which == 13) params.callback(+ev.target.value);
		});
	}

	reset(value) {
		this.el.value = "";
		this.el.placeholder = value;
	}

	set(value) {
		this.el.value = value;
	}
}