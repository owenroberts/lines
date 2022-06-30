class UITimelineGroup extends UICollection {
	constructor(layers, params) {
		super(params);
		this.layers = layers;
		this.addClass('group');
		this.startFrame = params.startFrame;
		this.endFrame = params.endFrame;

		this.isToggled = false;
		const self = this;

		this.breakUp = new UIButton({
			type: 'group-breakup',
			class: 'timeline-btn',
			text: 'X',
			callback: function() {
				layers.forEach(layer => {
					layer.groupNumber = -1;
				});
				lns.ui.update();
			}
		});

		this.toggle = new UIToggle({
			type: 'group-toggle',
			class: 'timeline-btn',
			text: params.name,
			isOn: false,
			callback: function() {
				self.isToggled = !self.isToggled;
				layers.forEach(layer => {
					layer.toggle(self.isToggled);
					layer.isHighlighted = self.isToggled;
				});
			}
		});

		this.highlight = new UIToggle({
			type: 'group-highlight',
			class: 'timeline-btn',
			text: '*',
			isOn: false,
			callback: function() {
				layers.forEach(layer => {
					layer.isHighlighted = !layer.isHighlighted;
				});
			}
		});

		this.lock = new UIToggle({
			type: 'group-lock',
			text: 'L',
			class: 'timeline-btn',
			isOn: false,
			callback: function() {
				layers.forEach(layer => {
					layer.isLocked = !layer.isLocked;
				});
			}
		});

		this.edit = new UIButton({
			type: 'layer-edit',
			class: 'timeline-btn',
			text: "E",
			callback: () => {
				const modal = new UIModal('Edit Layer', lns, this.position, () => {
					lns.ui.update();
				});

				modal.addBreak("Start Frame:");
				modal.add(new UINumber({
					value: params.startFrame,
					callback: function(value) {
						layers.forEach(layer => {
							layer.startFrame = +value;
						});
					}
				}));

				modal.addBreak("End Frame:");
				modal.add(new UINumber({
					value: params.endFrame,
					callback: function(value) {
						layers.forEach(layer => {
							layer.endFrame = +value;
						});
					}
				}));

				modal.adjustPosition();
			}
		});

		this.left = new UIDragButton({
			text: '⬗',
			type: 'left',
			class: 'timeline-btn',
			callback: (dir, num) => {
				layers.forEach(layer => {
					layer.startFrame += (dir ? dir : -1) * (num ? num : 1);
				});
				lns.ui.update();
			}		
		});

		this.leftRight = new UIButton({
			text: '⬖',
			type: 'left-right',
			class: 'timeline-btn',
			callback: () => {
				layers.forEach(layer => {
					if (layer.endFrame == layer.startFrame) layer.endFrame += 1;
					layer.startFrame += 1;
				});
				lns.ui.update();
			}		
		});

		this.right = new UIDragButton({
			text: '⬖',
			type: 'right',
			class: 'timeline-btn',
			callback: (dir, num) => {
				console.log(layers);
				layers.forEach(layer => {
					layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				});
				lns.ui.update();
			}		
		});

		this.rightLeft = new UIButton({
			text: '⬖',
			type: 'right-left',
			class: 'timeline-btn',
			callback: () => {
				layers.forEach(layer => {
					if (layer.endFrame === layer.startFrame) layer.endFrame += -1;
					layer.endFrame += -1;
				});
				lns.ui.update();
			}		
		});

		this.setup(params.width);
	}

	setup(width) {
		if (this.startFrame > 0) this.append(this.left);
		if (width > 70) this.append(this.leftRight);
		this.append(this.toggle);
		if (width > 30) this.append(this.highlight);
		if (width > 40) this.append(this.lock);
		if (width > 50) this.append(this.edit);
		if (width > 60) this.append(this.breakUp);

		if (width > 80) {
			this.append(this.rightLeft);
			this.rightLeft.addClass('right-margin');
		} else {
			this.right.addClass('right-margin');
		}
		this.append(this.right);
	}
}