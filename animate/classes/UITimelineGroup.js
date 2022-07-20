class UITimelineGroup extends UICollection {
	constructor(layers, params) {
		super(params);
		this.index = params.index;
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
			isOn: this.isToggled,
			callback: function(isOn) {
				self.isToggled = isOn !== undefined ? isOn : !self.isToggled;
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
				const modal = new UIModal({
					title: 'Edit Layer', 
					app: lns, 
					position: this.position, 
					callback: () => {
						lns.ui.update();
					}
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

		this.removeLayer = new UIButton({
			type: 'group-remove-layer',
			class: 'timeline-btn',
			text: 'R',
			callback: () => {
				const clearFunc = function() {
					lns.ui.timeline.resetLayers()
					lns.ui.update();
				};

				const modal = new UIModal({
					title: 'Remove Layers', 
					app: lns, 
					position: this.position, 
					callback: clearFunc, 
					onClear: clearFunc
				});

				for (let i = 0, len = lns.anim.layers.length; i < len; i++) {
					if (lns.anim.layers[i].groupNumber !== this.index) continue;
					const layer = lns.anim.layers[i];
					// current highlight system cant do diff layers
					// const color = '#' + Math.floor(Math.random()*16777215).toString(16);
					// layer.isHighlighted = true;
					// layer.highlightColor = color;
					const layerButton = new UIButton({
						text: `Layer ${i}, Drawing ${layer.drawingIndex}`,
						// css: { "background": color },
						callback: function() {
							layer.groupNumber = -1;
							modal.remove(layerButton);
						}
					});
					modal.add(layerButton);
				}
			}
		});

		this.startFrameNumber = new UINumberStep({
			value: this.startFrame,
			class: 'timeline-btn',
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.startFrame = +value;
					if (+value > layer.endFrame) {
						layer.endFrame = +value;
					}
				});
				lns.ui.update();
			}
		});

		this.endFrameNumber = new UINumberStep({
			value: this.endFrame,
			class: 'timeline-btn',
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.endFrame = +value;
					if (+value < layer.startFrame) {
						layer.startFrame = +value;
					}
				});
				lns.ui.update();
			}
		});

		this.setup(params.width);
	}

	setup(width) {
		if (width > 20) this.append(this.startFrameNumber);
		this.append(this.toggle);
		this.append(this.highlight);
		if (width > 40) this.append(this.edit);
		if (width > 50) this.append(this.lock);
		if (width > 60) this.append(this.breakUp);
		if (width > 70) this.append(this.removeLayer);

		if (width > 80) {
			this.append(this.endFrameNumber);
			this.endFrameNumber.addClass('right-margin');
		}
	}
}