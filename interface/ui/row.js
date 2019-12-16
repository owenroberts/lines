class UIRow extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('row');
	}

	clear() {

		/* remove keys */
		for (const key in this) {
			if (key !== undefined && key !== 'el') {
				delete this[key];
			}
		}

		while (this.el.firstChild) {
			this.el.firstChild.value = null; /* prevent blur event */
			this.el.removeChild(this.el.firstChild);
		}

	}
}