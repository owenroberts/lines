class UILayer extends UICollection {
	constructor(layer, params) {
		super(params);
		this.addClass('layer');
		this.layer = layer;
		if (params.canMoveUp) this.canMoveUp = params.canMoveUp;
		const self = this;

		this.toggle = new UIToggle({
			type: 'layer-toggle',
			class: 'timeline-btn',
			text: `${layer.drawingIndex}`,
			isOn: layer.isToggled,
			callback: function(isOn) {
				// better way to do this annoying long line?
				layer.isToggled = isOn !== undefined ? isOn : !layer.isToggled;
				// set properties
				if (layer.isToggled) {
					lns.draw.setProperties(layer.getEditProps(), true); // set ui only
				}
				// self.toggle.set(layer.isToggled);
				self.highlight.update(layer.isToggled);
			}
		});

		this.highlight = new UIToggle({
			type: 'layer-highlight',
			class: 'timeline-btn',
			text: '*',
			isOn: layer.isHighlighted,
			callback: function(isOn) {
				layer.isHighlighted = isOn !== undefined ? isOn : !layer.isHighlighted;
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
					callback: () => { lns.ui.update(); }
				});

				modal.add(new UIButton({ 
					text: "Cut Segment",
					callback: () => {
						const drawing = lns.anim.drawings[layer.drawingIndex];
						drawing.pop(); /* remove "end" */
						drawing.pop(); /* remove segment */
						drawing.add('end'); /* new end */
						layer.resetDrawingEndIndex(drawing.length);
					}
				}));

				modal.add(new UIButton({
					text: "Cut Line",
					callback: () => {
						const drawing = lns.anim.drawings[layer.drawingIndex];
						drawing.pop(); /* remove "end" */
						for (let i = drawing.length - 1; i > 0; i--) {
							if (drawing.get(i)[0] !== 'end') drawing.pop();
							else break;
						}
						layer.resetDrawingEndIndex(drawing.length);
					}
				}));

				modal.add(new UIButton({
					text: "Clone",
					callback: () => {
						const props = layer.getCloneProps();
						props.startFrame = props.endFrame = layer.endFrame + 1;
						lns.anim.addLayer(new Layer(props));
						lns.ui.play.setFrame(layer.endFrame + 1);
					}
				}));

				modal.add(new UIButton({
					text: "Split",
					callback: () => {
						const props = layer.getCloneProps();
						props.startFrame = lns.anim.currentFrame + 1;
						layer.endFrame = lns.anim.currentFrame;
						lns.anim.addLayer(new Layer(props));
						lns.ui.play.setFrame(layer.endFrame + 1);
					}
				}));

				modal.addBreak("Start Frame:");
				modal.add(new UINumber({
					value: layer.startFrame,
					callback: function(value) {
						layer.startFrame = +value;
					}
				}));

				modal.addBreak("End Frame:");
				modal.add(new UINumber({
					value: layer.endFrame,
					callback: function(value) {
						layer.endFrame = +value;
					}
				}));

				modal.adjustPosition();
			}
		});

		this.tween = new UIButton({
			text: "T",
			class: 'timeline-btn',
			type: 'layer-tween',
			callback: () => {
				
				const tween = {
					prop: 'endIndex',
					startFrame: lns.anim.currentFrame,
					endFrame: lns.anim.currentFrame + 10,
					startValue: 0,
					endValue: 'end'
				};

				const modal = new UIModal('Add Tween', lns, this.position, function() {
					tween.endValue = lns.anim.drawings[layer.drawingIndex].length;
					layer.addTween(tween);
					lns.ui.update();
				});

				modal.addBreak('Property:');
				modal.add(new UISelect({
					// redo props, add linesInterval 
					// interpolation?
					options: Object.keys(layer.getTweenProps()),
					value: 'endIndex',
					selected: 'endIndex',
					callback: function(value) {
						tween.prop = value;
					}
				}));

				modal.addBreak('Start Frame:');
				modal.add(new UINumber({
					value: tween.startFrame,
					callback: function(value) {
						tween.startFrame = +value;
					}
				}));

				modal.addBreak('End Frame:');
				modal.add(new UINumber({
					value: tween.endFrame,
					callback: function(value) {
						tween.endFrame = +value;
					}
				}));

				modal.addBreak('Start Value:');
				modal.add(new UINumber({
					value: tween.startValue,
					callback: function(value) {
						tween.startValue = +value;
					}
				}));

				modal.addBreak('End Value:');
				modal.add(new UINumber({
					value: tween.endValue,
					callback: function(value) {
						tween.endValue = +value;
					}
				}));
			}
		});

		this.remove = new UIButton({
			type: 'remove',
			text: 'X',
			class: 'timeline-btn',
			callback: () => {
				lns.anim.layers.splice(lns.anim.layers.indexOf(layer), 1);
				lns.ui.update();
			}
		});

		this.startFrameNumber = new UINumberStep({
			value: layer.startFrame,
			class: 'timeline-btn',
			min: 0,
			max: lns.anim.endFrame + 1,
			callback: value => {
				layer.startFrame = +value;
				// if frame is set move everything -- right functionality?
				if (+value > layer.endFrame) {
					layer.endFrame = +value;
				}
				lns.ui.update();
			}
		});

		this.endFrameNumber = new UINumberStep({
			value: layer.endFrame,
			class: 'timeline-btn',
			min: 0,
			callback: value => {
				layer.endFrame = +value;
				if (+value < layer.startFrame) {
					layer.startFrame = +value;
				}
				lns.ui.update();
			}
		});

		this.lock = new UIToggle({
			type: 'layer-lock',
			text: 'L',
			class: 'timeline-btn',
			isOn: layer.isLocked,
			callback: function() {
				layer.isLocked = !layer.isLocked;
			}
		});

		this.moveUp = new UIButton({
			text: '^',
			type:'move-up',
			class: 'timeline-btn',
			callback: params.moveUp
		});

		this.addToGroup = new UIButton({
			text: 'G',
			type: 'add-to-group',
			class: 'timeline-btn',
			callback: () => {
				params.addToGroup(this.position); // cant get position, node from original is gone?
			}
		});

		if (params.group) {
			this.groupLabel = new UILabel({ text: params.group });
		}

		this.setup(params.width);
	}

	setup(width) {
		if (width > 20) this.append(this.startFrameNumber);
		this.append(this.toggle);
		this.append(this.highlight);
		if (width > 40) this.append(this.edit);
		if (width > 50) this.append(this.lock);
		if (width > 60) this.append(this.tween);
		if (width > 70) this.append(this.remove);
		if (width > 80) this.append(this.addToGroup);
		if (width > 90 && this.canMoveUp) this.append(this.moveUp);
		if (width > 100 && this.groupLabel) this.append(this.groupLabel);

		// has to go last
		if (width > 80) {
			this.append(this.endFrameNumber);
			this.endFrameNumber.addClass('right-margin');
		}
		
	}

	get html() {
		return this.el;
	}
}