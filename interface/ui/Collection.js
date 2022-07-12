class UICollection extends UIElement {
	constructor(params) {
		super(params);
	}

	// k is the key value in the interface object
	append(ui, k) {
		if (k !== undefined) this[k] = ui;
		if (Array.isArray(ui.html)) {
			ui.html.forEach(el => {
				this.el.appendChild(el);
			});
		} else {
			this.el.appendChild(ui.el);
		}
	}

	remove(ui, k) {
		if (k) delete this[k];
		this.el.removeChild(ui.el);
	}

	removeK(k) {
		this.el.removeChild(this[k].el);
		delete this[k];
	}

	clear() {
		for (let i = this.el.children.length - 1; i >= 0; --i) {
  			this.el.children[i].remove();
		}
	}

	get uiList() {
		return Object.keys(this).filter(k => k !== 'el').map(k => this[k]);
	}

}