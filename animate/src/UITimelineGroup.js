class UITimelineGroup extends UICollection {
	constructor(layers, params) {
		super(params);
		this.index = params.index;
		this.layers = layers;
		this.addClass('group');
		this.startFrame = params.startFrame;
		this.endFrame = params.endFrame;
		this.update = params.update;
		this.reset = params.reset;
		const width = params.width;


		this.isToggled = false;
		const self = this;

		const toggle = new UIToggle({
			class: 'group-toggle',
			btnClass: 'timeline-btn',
			text: params.name,
			isOn: this.isToggled,
			callback: value => {
				this.isToggled = value;
				highlight.update(value);
				layers.forEach(layer => {
					layer.toggle(this.isToggled);
				});
			}
		});

		const highlight = new UIToggle({
			class: 'group-highlight',
			btnClass: 'timeline-btn',
			text: '*',
			isOn: false,
			callback: value => {
				layers.forEach(layer => {
					layer.isHighlighted = value;
				});
			}
		});

		const edit = new UIButton({
			class: 'layer-edit',
			btnClass: 'timeline-btn',
			text: "E",
			callback: () => {
				this.editModal(layers, params);
			}
		});

		const uis = this.getPropUIs(layers, params, false);

		if (width > 30) this.append(uis.startFrameNumber);
		this.append(toggle, 'toggle');
		this.append(highlight);
		if (width > 20) this.append(edit);
		if (width > 50) this.append(uis.lock, 'lock');
		if (width > 60) this.append(uis.breakUp);
		if (width > 70) this.append(uis.removeLayer);
		if (width > 80) this.append(uis.tween);
		if (width > 90) this.append(uis.moveUp);


		if (width > 80) {
			this.append(uis.endFrameNumber);
			uis.endFrameNumber.addClass('right-margin');
		}
	}

	getPropUIs(layers, params, isModal) {

		const btnClass = isModal ? 'btn' : 'timeline-btn';		

		const lock = new UIToggle({
			class: 'group-lock',
			text: isModal ? 'Lock' : 'L',
			btnClass: btnClass,
			isOn: false,
			callback: function() {
				layers.forEach(layer => {
					layer.isLocked = !layer.isLocked;
				});
			}
		});

		const breakUp = new UIButton({
			class: 'group-breakup',
			btnClass: btnClass,
			text: isModal ? 'Break up' : 'X',
			callback: () => {
				layers.forEach(layer => {
					layer.groupNumber = -1;
				});
				this.update();
			}
		});

		const removeLayer = new UIButton({
			class: 'group-remove-layer',
			btnClass: btnClass,
			text: isModal ? 'Remove Layer' : 'R',
			callback: () => {
				
				const clearFunc = () => {
					this.reset();
					this.update();
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

		const startFrameNumber = new UINumberStep({
			value: this.startFrame,
			class: isModal ? '' : btnClass,
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.startFrame = value;
					if (value > layer.endFrame) {
						layer.endFrame = value;
					}
					layer.resetTweens();
				});
				this.update();
			}
		});

		const endFrameNumber = new UINumberStep({
			value: this.endFrame,
			class: isModal ? '' : btnClass,
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.endFrame = value;
					if (value < layer.startFrame) {
						layer.startFrame = value;
					}
					layer.resetTweens();
				});
				this.update();
			}
		});

		const tween = new UIButton({
			text: isModal ? "Add Tween" : "T",
			class: btnClass,
			btnClass: 'group-tween',
			callback: () => { this.tweenModal(layers); }
		});

		const moveUp = new UIButton({
			text: isModal ? "Move Up" : '^',
			btnClass:'move-up',
			class: btnClass,
			callback: params.moveUp
		});

		const moveToBack = new UIButton({
			text: isModal ? "Move To Back" : '^',
			btnClass:'move-up',
			class: btnClass,
			callback: params.moveToBack
		});

		return { lock, breakUp, removeLayer, startFrameNumber, endFrameNumber, tween, moveUp, moveToBack };
	}

	editModal(layers, params) {

		const modal = new UIModal({
			title: 'Edit Group', 
			app: lns,
			position: this.position, 
			callback: () => { this.update(); }
		});

		const uis = this.getPropUIs(layers, params, true);
		for (const k in uis) {
			if (k === 'startFrameNumber') modal.addBreak("Start Frame:");
			if (k === 'endFrameNumber') modal.addBreak("End Frame:");
			modal.add(uis[k]);
		}

		modal.adjustPosition();	
	}

	tweenModal(layers) {

		// not DRY

		const tween = {
			prop: 'endIndex',
			startFrame: lns.anim.currentFrame,
			endFrame: lns.anim.currentFrame + 10,
			startValue: 0,
			endValue: 'end'
		};

		const modal = new UIModal({
			title: 'Add Tween', 
			app: lns, 
			position: this.position, 
			callback: () => {
				layers.forEach(layer => {
					if (tween.endValue === 'end' && tween.prop === 'endIndex') {
						tween.endValue = lns.anim.drawings[layer.drawingIndex].length;
					}
					layer.addTween({ ...tween });
				});
				this.update();
			}
		});

		modal.addBreak('Property:');
		modal.add(new UISelect({
			options: Object.keys(layers[0].getTweenProps()),
			value: 'endIndex',
			selected: 'endIndex',
			callback(value) { tween.prop = value; }
		}));

		modal.addBreak('Start Frame:');
		modal.add(new UINumber({
			value: tween.startFrame,
			callback(value) { tween.startFrame = value; }
		}));

		modal.addBreak('End Frame:');
		modal.add(new UINumber({
			value: tween.endFrame,
			callback(value) { tween.endFrame = value; }
		}));

		modal.addBreak('Start Value:');
		modal.add(new UINumber({
			value: tween.startValue,
			callback(value) { tween.startValue = value; }
		}));

		modal.addBreak('End Value:');
		modal.add(new UINumber({
			value: tween.endValue,
			callback(value) { tween.endValue = value; }
		}));

	}
}