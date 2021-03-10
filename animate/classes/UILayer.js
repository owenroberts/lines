class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.addClass('layer');
		this.layer = layer;

		this.toggle = new UIToggle({
			type: 'layer-toggle',
			text: `${layer.drawingIndex}`,
			callback: params.callback
		});

		this.edit = new UIButton({
			type: 'layer-edit',
			text: "✎",
			callback: () => {
				const modal = new UIModal('Edit Layer', lns, this.position, () => {
					// this.update();
					lns.ui.update();
				});

				modal.add(new UIButton({ 
					text: "Cut Segment",
					callback: () => {
						const drawing = lns.anim.drawings[layer.drawingIndex];
						drawing.pop(); /* remove "end" */
						drawing.pop(); /* remove segment */
						drawing.push('end'); /* new end */
					}
				}));

				modal.add(new UIButton({
					text: "Cut Line",
					callback: () => {
						const drawing = lns.anim.drawings[layer.drawingIndex];
						drawing.pop(); /* remove "end" */
						for (let i = drawing.length - 1; i > 0; i--) {
							if (drawing[i] != 'end') drawing.pop();
							else break;
						}
					}
				}));

				modal.add(new UIButton({
					text: "Clone",
					callback: () => {
						const newLayer = new Layer(_.cloneDeep(layer));
						newLayer.startFrame = newLayer.endFrame = layer.endFrame + 1;
						lns.anim.layers.splice(lns.anim.layers.length - 1, 0, newLayer);
						lns.ui.play.setFrame(layer.endFrame + 1);
					}
				}));

				modal.add(new UIButton({
					text: "Split",
					callback: () => {
						const newLayer = new Layer(_.cloneDeep(layer));
						newLayer.startFrame = lns.anim.currentFrame + 1;
						layer.endFrame = lns.anim.currentFrame;
						lns.anim.layers.splice(lns.anim.layers.length - 1, 0, newLayer);
						lns.ui.play.setFrame(layer.endFrame + 1);
					}
				}));

				modal.addBreak();
				modal.addLabel("Start Frame:");
				modal.add(new UIBlur({
					value: layer.startFrame,
					callback: function(value) {
						layer.startFrame = +value;
					}
				}));

				modal.addBreak();
				modal.addLabel("End Frame:");
				modal.add(new UIBlur({
					value: layer.endFrame,
					callback: function(value) {
						layer.endFrame = +value;
					}
				}));

				modal.addBreak();
				modal.addLabel("Order");
				modal.add(new UIBlur({
					value: layer.order || 'None',
					callback: function(value) {
						layer.order = +value;
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

				modal.addBreak();
				modal.addLabel('Property:');
				modal.add(new UISelect({
					// redo props, add linesInterval 
					// interpolation?
					options: Object.keys(layer.tweenProps),
					value: 'endIndex',
					selected: 'endIndex',
					callback: function(value) {
						tween.prop = value;
					}
				}));

				modal.addBreak();
				modal.addLabel('Start Frame:');
				modal.add(new UIBlur({
					value: tween.startFrame,
					callback: function(value) {
						tween.startFrame = +value;
					}
				}));

				modal.addBreak();
				modal.addLabel('End Frame:');
				modal.add(new UIBlur({
					value: tween.endFrame,
					callback: function(value) {
						tween.endFrame = +value;
					}
				}));

				modal.addBreak();
				modal.addLabel('Start Value:');
				modal.add(new UIBlur({
					value: tween.startValue,
					callback: function(value) {
						tween.startValue = +value;
					}
				}));

				modal.addBreak();
				modal.addLabel('End Value:');
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

		this.right = new UIDragButton({
			text: '⬖',
			type: 'right',
			callback: (dir, num) => {
				layer.endFrame += (dir ? dir : 1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.append(this.toggle);
		this.append(this.edit);
		this.append(this.tween);
		this.append(this.remove);
		this.append(this.left);
		this.append(this.right);
	}

	get html() {
		return this.el;
	}
}