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
			callback: function() {
				// only update the values when toggling on, ignore when toggling off
				if (!layer.isToggled) {
					lns.draw.setProperties(layer.getEditProps(), true); // set ui only
				}
				layer.toggle();
				self.highlight.update(layer.isToggled);
			}
		});

		this.highlight = new UIToggle({
			type: 'layer-highlight',
			class: 'timeline-btn',
			text: '*',
			isOn: layer.isHighlighted,
			callback: function() {
				layer.isHighlighted = !layer.isHighlighted;
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

		this.left = new UIDragButton({
			text: '⬗',
			type: 'left',
			class: 'timeline-btn',
			callback: (dir, num) => {
				layer.startFrame += (dir ? dir : -1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.leftRight = new UIButton({
			text: '⬖',
			type: 'left-right',
			class: 'timeline-btn',
			callback: () => {
				if (layer.endFrame == layer.startFrame) layer.endFrame += 1;
				layer.startFrame += 1;
				lns.ui.update();
			}		
		});

		this.right = new UIDragButton({
			text: '⬖',
			type: 'right',
			class: 'timeline-btn',
			callback: (dir, num) => {
				layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.rightLeft = new UIButton({
			text: '⬖',
			type: 'right-left',
			class: 'timeline-btn',
			callback: () => {
				if (layer.endFrame === layer.startFrame) layer.endFrame += -1;
				layer.endFrame += -1;
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
			callback: params.addToGroup
		});

		this.setup(params.width);
		
	}

	setup(width) {
		if (this.layer.startFrame > 0) this.append(this.left);
		if (width > 70) this.append(this.leftRight);
		this.append(this.toggle);
		if (width > 30) this.append(this.highlight);
		if (width > 40) this.append(this.lock);
		if (width > 60) this.append(this.edit);
		if (width > 50) this.append(this.tween);
		if (width > 70) this.append(this.remove);
		if (width > 80) this.append(this.addToGroup);

		if (width > 90 && this.canMoveUp) this.append(this.moveUp);
		
		if (width > 80) {
			this.append(this.rightLeft);
			this.rightLeft.addClass('right-margin');
		} else {
			this.right.addClass('right-margin');
		}
		this.append(this.right);
	}

	get html() {
		return this.el;
	}
}