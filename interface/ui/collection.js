class UICollection extends UIElement {
	constructor(params) {
		super(params);
	}

	append(ui) {
		if (ui.el.id) this[ui.el.id] = ui;
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