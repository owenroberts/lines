class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.el.classList.add('layer');
		this.el.style.gridColumnStart = layer.startFrame + 1;
		this.el.style.gridColumnEnd = layer.endFrame + 1;
		this.el.style.gridRow = params.index + 1;

		this.left = new UIDragButton({
			text: '<',
			type: 'left',
			callback: ev => {
				if (layer.startFrame > 0)
					layer.startFrame++;
				this.update(layer);
			}		
		});
		this.append(this.left);

		this.toggle = new UIToggle({
			type: 'toggle',
			text: `d${layer.d}`,
			callback: params.callback
		});
		this.append(this.toggle);

		this.right = new UIDragButton({
			text: '>',
			type: 'right',
			callback: ev => {
				layer.endFrame++;
				this.update(layer);
			}		
		});
		this.append(this.right);
	}

	get elems() {
		return this.el;
	}

	update(layer) {
		this.el.style.gridColumnStart = layer.startFrame - 1;
		this.el.style.gridColumnEnd = layer.endFrame + 2;
	}
}