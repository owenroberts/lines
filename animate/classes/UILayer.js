class UILayer extends UICollection {
	constructor(params, layer, hasMultipleLayers) {
		super(params);
		this.addClass('layer');
		this.layer = layer;
		const width = params.width * (layer.endFrame - layer.startFrame + 1);

		this.toggle = new UIToggle({
			type: 'layer-toggle',
			text: `${layer.drawingIndex}`,
			callback: params.callback
		});

		this.highlight = new UIToggle({
			type: 'layer-highlight',
			text: '❏',
			callback: function() {
				layer.isHighlighted = !layer.isHighlighted;
			}
		})

		this.edit = new UIButton({
			type: 'layer-edit',
			text: "✎",
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
				modal.add(new UIBlur({
					value: layer.startFrame,
					callback: function(value) {
						layer.startFrame = +value;
					}
				}));

				modal.addBreak("End Frame:");
				modal.add(new UIBlur({
					value: layer.endFrame,
					callback: function(value) {
						layer.endFrame = +value;
					}
				}));
			}
		});

		this.tween = new UIButton({
			text: "⧉",
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
				modal.add(new UIBlur({
					value: tween.startFrame,
					callback: function(value) {
						tween.startFrame = +value;
					}
				}));

				modal.addBreak('End Frame:');
				modal.add(new UIBlur({
					value: tween.endFrame,
					callback: function(value) {
						tween.endFrame = +value;
					}
				}));

				modal.addBreak('Start Value:');
				modal.add(new UIBlur({
					value: tween.startValue,
					callback: function(value) {
						tween.startValue = +value;
					}
				}));

				modal.addBreak('End Value:');
				modal.add(new UIBlur({
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
			callback: () => {
				lns.anim.layers.splice(lns.anim.layers.indexOf(layer), 1);
				lns.ui.update();
			}
		});

		this.left = new UIDragButton({
			text: '⬗',
			type: 'left',
			callback: (dir, num) => {
				layer.startFrame += (dir ? dir : -1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.leftRight = new UIButton({
			text: '⬖',
			type: 'left-right',
			callback: () => {
				if (layer.endFrame == layer.startFrame) layer.endFrame += 1;
				layer.startFrame += 1;
				lns.ui.update();
			}		
		});

		this.right = new UIDragButton({
			text: '⬖',
			type: 'right',
			callback: (dir, num) => {
				layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.rightLeft = new UIButton({
			text: '⬖',
			type: 'right-left',
			callback: () => {
				if (layer.endFrame === layer.startFrame) layer.endFrame += -1;
				layer.endFrame += -1;
				lns.ui.update();
			}		
		});

		this.moveUp = new UIButton({
			text: '^',
			type:'move-up',
			callback: params.moveUp
		});

		if (layer.startFrame > 0) this.append(this.left);
		if (width > 70) this.append(this.leftRight);
		this.append(this.toggle);
		if (width > 30) this.append(this.highlight);
		if (width > 40) this.append(this.edit);
		if (width > 60) this.append(this.tween);
		if (width > 50) this.append(this.remove);
		if (width > 90 && hasMultipleLayers) this.append(this.moveUp);
		
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