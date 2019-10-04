class UISelectButton extends UICollection {
	constructor(params) {
		super(params);

		this.select = new UISelect({
			id: `${params.id}-select`,
			options: params.options,
			callback: function() {
				// do nothing ? to prevent error 
			}
		});

		this.btn = new UIButton({
			id: `${params.id}-btn`,
			callback: () => {
				params.callback(this.select.getValue());
			}
		});
	}
}