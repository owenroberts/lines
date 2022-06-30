class UINumber extends UIText {
	update(value, uiOnly) {

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

		if (this.callback && !uiOnly) this.callback(value);
		this.value = value;
	}
}