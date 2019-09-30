class UICollection extends UIElement {
	constructor(params) {
		super(params);
	}

	append(ui) {
		const elem = ui.getElem();
		if (Array.isArray(elem)) {
			for (let i = 0; i < elem.length; i++) {
				this.el.appendChild(elem[i]);
			}
		} else {
			this.el.appendChild(elem);
		}
	}

	remove(ui) {
		this.el.removeChild(ui.el);
	}
}