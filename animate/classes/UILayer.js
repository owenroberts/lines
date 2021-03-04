class UILayer extends UICollection {
	constructor(params, layer) {
		super(params);
		this.addClass('layer');
		this.layer = layer;

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
					// this.update();
					lns.ui.update();
				});

				modal.add(new UIButton({ 
					text: "Cut Segment",
					callback: () => {
						const drawing = lns.anim.drawings[layer.d];
						drawing.pop(); /* remove "end" */
						drawing.pop(); /* remove segment */
						drawing.push('end'); /* new end */
					}
				}));

				modal.add(new UIButton({
					text: "Cut Line",
					callback: () => {
						const drawing = lns.anim.drawings[layer.d];
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
					prop: 'e',
					sf: lns.anim.currentFrame,
					ef: lns.anim.currentFrame + 10,
					sv: 0,
					ev: 'end'
				};

				const modal = new UIModal('Add Tween', lns, this.position, function() {
					tween.ev = lns.anim.drawings[layer.d].length;
					layer.addTween(tween);
					lns.ui.update();
				});

				modal.add(new UILabel({ text: 'Property:' }));
				modal.add(new UISelect({
					options: ['e', 's', 'n', 'r', 'w', 'v', 'x', 'y'],
					value: 'e',
					selected: 'e',
					callback: function(value) {
						tween.prop = value;
					}
				}));

				modal.add(new UILabel({ text: 'Start Frame:' }));
				modal.add(new UIBlur({
					value: tween.sf,
					callback: function(value) {
						tween.sf = +value;
					}
				}));

				modal.add(new UILabel({ text: 'End Frame:' }));
				modal.add(new UIBlur({
					value: tween.ef,
					callback: function(value) {
						tween.ef = +value;
					}
				}));

				modal.add(new UILabel({ text: 'Start Value:' }));
				modal.add(new UIBlur({
					value: tween.sv,
					callback: function(value) {
						tween.sv = +value;
					}
				}));

				modal.add(new UILabel({ text: 'End Value:' }));
				modal.add(new UIBlur({
					value: tween.ev,
					callback: function(value) {
						tween.ev = +value;
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