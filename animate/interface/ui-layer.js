class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.el.classList.add('layer');
		this.layer = layer;
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

		for (let i = 0; i < layer.a.length; i++) {
			this.anim = new UIAnimation(layer.a[i]);
			this.append(this.anim );
		}

		this.update();
	}

	get elems() {
		return this.el;
	}

	update() {
		/* position in grid */
		this.el.style.gridColumnStart = this.layer.startFrame + 1;
		this.el.style.gridColumnEnd = this.layer.endFrame + 2;

		/* grid for children */
		this.el.style['grid-template-columns'] = `auto repeat(${this.layer.endFrame - this.layer.startFrame + 1}, 1fr) auto`;

		this.toggle.el.style['grid-column'] = `2 / span ${this.layer.endFrame - this.layer.startFrame + 1}`;

		this.anim.update();
	}
}