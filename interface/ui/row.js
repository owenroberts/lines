class UIRow extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('row');
	}

	clear() {
		while (this.el.firstChild) {
			this.el.firstChild.value = null; /* prevent blur event */
			this.el.removeChild(this.el.firstChild);
		}
	}
}