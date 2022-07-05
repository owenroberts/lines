class UINumber extends UIText {
	constructor(params) {
		super(params);
		this.el.classList.add('number');
	}

	update(value, uiOnly) {
		if (!value) return;
		if (typeof value === 'string') {
			if (value.match(/\D/)) {
				try {
					value = eval(value);
				} catch(e) {
					alert("Please enter a numerical value or mathematical expression.");
					return;
				}
			}
		}

		this.value = value;
		if (this.callback && !uiOnly) this.callback(value);
		
	}
}