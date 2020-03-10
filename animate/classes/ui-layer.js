class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.el.classList.add('layer');
		this.layer = layer;
		// this.el.style.gridRow = params.index + 1;

		this.toggle = new UIToggle({
			type: 'layer-toggle',
			text: `${layer.d}`,
			callback: params.callback
		});

		this.edit = new UIButton({
			type: 'layer-edit',
			text: "✎",
			callback: () => {
				const modal = new UIModal('Edit Layer', lns, this.position, () => {
					this.update();
					lns.ui.update();
				});

				modal.add(new UILabel({ text: "Start Frame:"}));
				modal.add(new UIBlur({
					value: layer.startFrame,
					callback: function(value) {
						layer.startFrame = +value;
					}
				}));

				modal.add(new UILabel({ text: "End Frame:"}));
				modal.add(new UIBlur({
					value: layer.endFrame,
					callback: function(value) {
						layer.endFrame = +value;
					}
				}));
			}
		});

		this.left = new UIDragButton({
			text: '+',
			type: 'left',
			callback: (dir, num) => {
				layer.startFrame += (dir ? dir : -1) * (num ? num : 1);
				this.update();
				lns.ui.update();
			}		
		});

		this.right = new UIDragButton({
			text: '+',
			type: 'right',
			callback: (dir, num) => {
				layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				this.update();
				lns.ui.update();
			}		
		});

		this.append(this.left);
		this.append(this.edit);
		this.append(this.toggle);
		this.append(this.right);

		this.tweens = [];
		for (let i = 0; i < layer.t.length; i++) {
			this.tweens[i] = new UITween(layer.t[i]);
			this.append(this.tweens[i]);
		}

		// this.update();
	}

	get html() {
		return this.el;
	}

	addTween(tween) {
		const tweenUI = new UITween(tween);
		this.tweens.push(tweenUI);
		this.append(tweenUI);
	}

	update() {
		/* position in grid */
		this.el.style.gridColumnStart = 1; // this.layer.startFrame + 1;
		this.el.style.gridColumnEnd = lns.anim.endFrame + 2; // this.layer.endFrame + 2;

		/* grid for children */
		this.el.style['grid-template-columns'] = `auto auto repeat(${lns.anim.endFrame}, 1fr) auto`;

		this.left.el.style['grid-column'] = `${this.layer.startFrame + 1} / span 1`;
		this.toggle.el.style['grid-column'] = `${this.layer.startFrame + 3} / span ${this.layer.endFrame - this.layer.startFrame}`;

		for (let i = 0; i < this.layer.t.length; i++) {
			if (this.tweens[i]) this.tweens[i].update();
			else this.addTween(this.layer.t[i])
		}
	}

	remove() {
		this.el.remove();
	}
}