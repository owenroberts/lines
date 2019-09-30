class UIRow extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('row');
	}

	/* part of collection? 
		add ui to row instead of els */
	clear() {
		while (this.el.firstChild) {
			this.el.firstChild.value = null;
			this.el.removeChild(this.el.firstChild);
		}
	}
}