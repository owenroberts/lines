import { UICollection, UIToggle, UIButton, UINumberStep, UILabel, UISelect, UINumber } from '../../../oi/src/oi.js';

export class UITimelineGroup extends UICollection {
	constructor(layers, params) {
		super(params);
		this.addClass('group');
		
		this.ui = params.ui;
		this.anim = params.anim;
		this.index = params.index;
		this.layers = layers;
		this.startFrame = params.startFrame;
		this.endFrame = params.endFrame;
		this.update = params.update;
		this.reset = params.reset;
		this.isToggled = false;

		const toggle = new UIToggle({
			class: 'group-toggle',
			buttonClass: 'timeline-button',
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
			buttonClass: 'timeline-button',
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
			buttonClass: 'timeline-button',
			text: "E",
			callback: () => {
				this.editModal(layers, params);
			}
		});

		const uis = this.getPropUIs(layers, params, false);
		const width = params.width;

		if (width > 30) this.append(uis.startFrameNumber);
		this.append(toggle, 'toggle');
		this.append(highlight);
		this.append(edit);
		if (width > 50) this.append(uis.lock, 'lock');
		if (width > 60) this.append(uis.breakUp);
		if (width > 70) this.append(uis.removeLayer);
		if (width > 80) this.append(uis.keyframes);
		if (width > 90) this.append(uis.moveUp);

		if (width > 80) {
			this.append(uis.endFrameNumber);
			uis.endFrameNumber.addClass('right-margin');
		}
	}

	getPropUIs(layers, params, isModal) {

		const buttonClass = isModal ? 'btn' : 'timeline-button';		

		const lock = new UIToggle({
			class: 'group-lock',
			text: isModal ? 'Lock' : 'L',
			buttonClass: buttonClass,
			isOn: false,
			callback: function() {
				layers.forEach(layer => {
					layer.isLocked = !layer.isLocked;
				});
			}
		});

		const breakUp = new UIButton({
			class: 'group-breakup',
			buttonClass: buttonClass,
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
			buttonClass: buttonClass,
			text: isModal ? 'Remove Layer' : 'R',
			callback: () => {
				
				const clearFunc = () => {
					this.reset();
					this.update();
				};

				const modal = new UIModal({
					title: 'Remove Layers', 
					ui: this.ui, 
					callback: clearFunc, 
					onClear: clearFunc
				});

				for (let i = 0, len = this.anim.layers.length; i < len; i++) {
					if (this.anim.layers[i].groupNumber !== this.index) continue;
					const layer = this.anim.layers[i];
					// current highlight system cant do diff layers
					// const color = '#' + Math.floor(Math.random()*16777215).toString(16);
					// layer.isHighlighted = true;
					// layer.highlightColor = color;
					const layerButton = new UIButton({
						text: `layer ${i}, drawing ${layer.drawingIndex}`,
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
			class: isModal ? '' : buttonClass,
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.startFrame = value;
					if (value > layer.endFrame) {
						layer.endFrame = value;
					}
					layer.resetKeyframes();
				});
				this.update();
			}
		});

		const endFrameNumber = new UINumberStep({
			value: this.endFrame,
			class: isModal ? '' : buttonClass,
			min: 0,
			callback: value => {
				layers.forEach(layer => {
					layer.endFrame = value;
					if (value < layer.startFrame) {
						layer.startFrame = value;
					}
					layer.resetKeyframes();
				});
				this.update();
			}
		});

		const keyframes = new UIButton({
			text: isModal ? "add keyframe" : "K",
			class: buttonClass,
			buttonClass: 'layer-keyframe',
			callback: () => {
				throw new Error("figure out group layers thing");
				const keyFrameModal = new UIKeyFrameModal({
					ui: this.ui,
					anim: this.anim,
					layer: this.layer,
				});
			}
		});

		const moveUp = new UIButton({
			text: isModal ? "Move Up" : '^',
			buttonClass:'move-up',
			class: buttonClass,
			callback: params.moveUp
		});

		const moveToBack = new UIButton({
			text: isModal ? "Move To Back" : '^',
			buttonClass:'move-up',
			class: buttonClass,
			callback: params.moveToBack
		});

		return { lock, breakUp, removeLayer, startFrameNumber, endFrameNumber, keyframes, moveUp, moveToBack };
	}

	editModal(layers, params) {

		const modal = new UIModal({
			title: 'Edit Group', 
			ui: this.ui,
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

	keyframesModal(layers) {

		const keyframes = createTween({
			prop: 'endIndex',
			startFrame: this.anim.currentFrame,
			endFrame: this.anim.currentFrame + 10,
			startValue: 0,
			endValue: 'end'
		});

		const modal = new UIModal({
			title: 'Add Tween', 
			ui: this.ui,
			position: this.position, 
			callback: () => {
				layers.forEach(layer => {
					if (keyframes.endValue === 'end' && keyframes.prop === 'endIndex') {
						keyframes.endValue = this.anim.drawings[layer.drawingIndex].length;
					}
					layer.addTween({ ...keyframes });
				});
				this.update();
			}
		});

		modal.addBreak('Property:');
		modal.add(new UISelect({
			options: ['segmentNum', 'jiggleRange', 'wiggleRange', 'wiggleSpeed', 'linesInterval', 'startIndex', 'endIndex'], // put this in Contants, CNTS?
			value: 'endIndex',
			selected: 'endIndex',
			callback(value) { keyframes.prop = value; }
		}));

		modal.addBreak('Start Frame:');
		modal.add(new UINumber({
			value: keyframes.startFrame,
			callback(value) { keyframes.startFrame = value; }
		}));

		modal.addBreak('End Frame:');
		modal.add(new UINumber({
			value: keyframes.endFrame,
			callback(value) { keyframes.endFrame = value; }
		}));

		modal.addBreak('Start Value:');
		modal.add(new UINumber({
			value: keyframes.startValue,
			callback(value) { keyframes.startValue = value; }
		}));

		modal.addBreak('End Value:');
		modal.add(new UINumber({
			value: keyframes.endValue,
			callback(value) { keyframes.endValue = value; }
		}));
	}
}