class UISelectButton extends UICollection {
	constructor(params) {
		super(params);

		const select = new UISelect({
			options: params.options,
			callback: function() {
				// do nothing ? to prevent error 
			}
		});

		const btn = new UIButton({
			text: "+",
			css: { 'margin-left': '1px' },
			callback: () => {
				params.callback(select.value);
			}
		});

		this.append(select, 'select');
		this.append(btn);

		if (params.btns) {
			params.btns.forEach(btn => {
				const b = new UIButton({
					text: btn.text,
					css: { 'margin-left': '1px' },
					callback: () => {
						btn.callback(select.value);
					}
				});
				this.append(b);
			});
		}

	}
}