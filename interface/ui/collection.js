class UICollection extends UIElement {
	constructor(params) {
		super(params);
	}

	append(ui, k) {
		if (k !== undefined) this[k] = ui;
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