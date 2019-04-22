class UIText extends UI {
	constructor(params) {
		params.tag = "input";
		params.event = "keyup";
		super(params);
		this.el.type = "text";
		this.el.placeholder = params.placeholder || params.title;
		
		if (params.blur) {
			this.el.addEventListener("blur", ev => {
				if (ev.target.value) {
					this.handler(ev, this);
				}
			});
		}

		this.el.addEventListener('keyup', ev => {
			if (ev.which == 13) {
				this.handler(ev, this);
			}
		});
	}

	handler(ev, self) {
		const value = ev.target.value;
		self.callback(value);
		self.set(value);
	}

	set(value) {
		this.el.value = "";
		this.el.placeholder = value;
	}
}