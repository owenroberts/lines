class UISelectButton extends UICollection {
	constructor(params) {
		super(params);

		this.select = new UISelect({
			options: params.options,
			callback: function() {
				// do nothing ? to prevent error 
			}
		});

		this.btn = new UIButton({
			text: "+",
			css: { 'margin-left': '1px' },
			callback: () => {
				params.callback(this.select.value);
			}
		});
	}

	get elems() {
		return [this.select.el, this.btn.el];
	}
}