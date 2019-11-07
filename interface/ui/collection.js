class UICollection extends UIElement {
	constructor(params) {
		super(params);
		if (params.id) this.el.id = params.id;
	}


	append(ui) {
		if (Array.isArray(ui.elems)) {
			ui.elems.forEach(el => {
				this.el.appendChild(el);
			});
		} else {
			this.el.appendChild(ui.el);
		}
	}

	remove(ui) {
		this.el.removeChild(ui.el);
	}
}