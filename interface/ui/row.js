class UIRow extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('row');
	}

	add(ui) {
		this.append(ui);
	}

	clear() {
		while (this.el.firstChild) {
			this.el.firstChild.value = null; /* prevent blur event */
			this.el.removeChild(this.el.firstChild);
		}
	}
}