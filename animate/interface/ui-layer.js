class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.el.classList.add('layer');
		this.layer = layer;
		this.el.style.gridColumnStart = layer.startFrame + 1;
		this.el.style.gridColumnEnd = layer.endFrame + 2;
		this.el.style.gridRow = params.index + 1;

		this.toggle = new UIToggle({
			type: 'toggle',
			text: `✎${layer.d}`,
			callback: params.callback
		});

		this.left = new UIDragButton({
			text: '+',
			type: 'left',
			callback: (dir, num) => {
				layer.startFrame += (dir ? dir : -1) * (num ? num : 1);
				this.update();
			}		
		});
		this.append(this.left);
		this.append(this.toggle);

		this.right = new UIDragButton({
			text: '+',
			type: 'right',
			callback: (dir, num) => {
				layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				this.update();
			}		
		});
		this.append(this.right);
	}

	get elems() {
		return this.el;
	}

	update() {
		this.el.style.gridColumnStart = this.layer.startFrame + 1;
		this.el.style.gridColumnEnd = this.layer.endFrame + 2;
	}
}