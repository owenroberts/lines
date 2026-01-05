import { Points } from '../../src/lines.js';
import { UIModal, UICollection, UIToggle, UIButton, UINumberStep, UILabel, UISelect, UINumber, UIText } from '../../../oi/src/oi.js';

export class UILayer extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('layer');

		this.anim = params.anim;
		this.ui = params.ui;

		this.index = params.index;
		this.layer = params.layer;
		this.groups = params.groups;
		
		const width = params.width;

		const toggle = new UIButton({
			btnClass: 'layer-toggle',
			class: 'timeline-btn',
			text: this.index,
			callback: value => {
				this.ui.faces.activeLayerIndex.update(this.index);
			}
		});

		const edit = new UIButton({
			btnClass: 'layer-edit',
			class: 'timeline-btn',
			text: "E",
			callback: () => {
				this.editModal();
			}
		});

		const visible = new UIButton({
			btnClass: 'layer-edit',
			class: 'timeline-btn',
			text: "V",
			callback: () => {
				this.layer.isVisible = !this.layer.isVisible;
			}
		});

		if (params.group) {
			this.groupLabel = new UILabel({ text: this.params.group });
		}

		const uis = this.getUIs(false);

		if (width > 40) this.append(uis.startFrameIndex);
		this.append(toggle, 'toggle');
		this.append(uis.highlight);
		this.append(edit);
		this.append(visible);
		if (width < 20) this.append(uis.toEnd);
		if (width > 50) this.append(uis.lock, 'lock');
		if (width > 60) this.append(uis.tween);
		// if (width > 70) this.append(uis.remove);
		if (width > 80) this.append(uis.addToGroup);
		if (width > 90) this.append(uis.merge)
		if (width > 90 && params.canMoveUp) this.append(uis.moveUp);
	// move to back
		if (width > 100 && this.groupLabel) this.append(this.groupLabel);

		// has to go last
		if (width > 80) {
			this.append(uis.endFrameIndex);
			uis.endFrameIndex.addClass('right-margin');
		}
	}

	getUIs(isModal) {

		const btnClass = isModal ? 'btn' : 'timeline-btn';

		const highlight = new UIToggle({
			btnClass: 'layer-highlight',
			class: 'timeline-btn',
			text: isModal ? "highlight" : "*",
			isOn: this.layer.isHighlighted,
			callback: value => {
				this.layer.isHighlighted = value;
			}
		});

		const tween = new UIButton({
			text: isModal ? "add tween" : "T",
			class: btnClass,
			btnClass: 'layer-tween',
			callback: () => { this.tweenModal(this.layer); }
		});

		const remove = new UIButton({
			btnClass: 'remove',
			text: isModal ? "remove" : "X",
			class: btnClass,
			callback: () => {
				this.anim.removeLayer(this.layer);
				this.ui.update();
			}
		});

		const startFrameIndex = new UINumberStep({
			value: this.layer.startFrame,
			class: isModal ? '' : btnClass,
			min: 0,
			max: this.anim.endFrame + 1,
			callback: value => {
				this.layer.startFrame = value;
				// if frame is set move everything -- right functionality?
				if (value > this.layer.endFrame) {
					this.layer.endFrame = value;
				}
				this.layer.resetTweens();
				this.ui.update();
			}
		});

		const endFrameIndex = new UINumberStep({
			value: this.layer.endFrame,
			class: isModal ? '' : btnClass,
			min: 0,
			callback: value => {
				this.layer.endFrame = value;
				if (value < this.layer.startFrame) {
					this.layer.startFrame = value;
				}
				this.layer.resetTweens();
				this.update();
			}
		});

		const toEnd = new UIButton({
			text: isModal ? 'to end' : '>>',
			class: isModal ? '' : btnClass,
			callback: () => {
				this.layer.endFrame = this.anim.endFrame;
				this.ui.update();
			}
		});

		const lock = new UIToggle({
			btnClass: 'layer-lock',
			text: isModal ? 'lock' : 'L',
			class: btnClass,
			isOn: this.layer.isLocked,
			callback: (value) => {
				this.layer.isLocked = value;
			}
		});

		const moveUp = new UIButton({
			text: isModal ? "move up" : '^',
			btnClass:'move-up',
			class: btnClass,
			callback: () => {
				this.anim.swapLayer(this.index, this.index - 1);
				this.ui.update();
			}
		});

		const moveToBack = new UIButton({
			text: isModal ? "move to back" : '^',
			btnClass:'move-up',
			class: btnClass,
			callback: () => {
				this.anim.sortLayer(this.index, 0);
				this.ui.update();
			}
		});

		const addToGroup = new UIButton({
			text: isModal ? 'group' : 'G',
			btnClass: 'add-to-group',
			class: btnClass,
			callback: () => {
				if (this.groups.length === 0) {
					alert("add groups");
					return;
				}

				this.ui.panels.styles.reset(); // save current lines
				let groupSelector = new UIModal({
					title: 'group',
					ui: this.ui,
					callback: () => {
						layer.groupNumber = +groupSelect.value;
						this.lastGroup = +groupSelect.value;
						this.ui.update();
					}
				});
				
				groupSelector.addBreak('groups:');
				
				let groupSelect = new UISelect({});
				for (let i = 0; i < this.groups.length; i++) {
					groupSelect.addOption(i, this.groups[i]);
				}
				if (this.lastGroup) groupSelect.value = this.lastGroup;
				groupSelector.add(groupSelect);
			}
		});

		const merge = new UIButton({
			text: isModal ? "merge" : 'M',
			class: btnClass,
			btnClass: 'merge-layer',
			callback: () => {
				const modal = new UIModal({
					text: 'merge with layer',
					ui: this.ui,
					callback: () => { this.ui.update(); },
					onClear: () => { this.ui.update(); },
				});

				for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
					const mergeLayer = this.anim.layers[i];
					if (mergeLayer === this.layer) continue;
					if (!mergeLayer.isInFrame(this.anim.currentFrame)) continue;

					modal.add(new UILabel({ text: `layer ${i}, drawing ${mergeLayer.drawingIndex}` }));

					modal.add(new UIToggle({
						text: "*",
						class: "left-end",
						isOn: mergeLayer.isHighlighted,
						callback: value => {
							mergeLayer.isHighlighted = value;
						}
					}));

					modal.add(new UIButton({
						text: "merge",
						class: 'right-end',
						callback: () => {
							this.anim.merge(this.layer.drawingIndex, mergeLayer.drawingIndex, this.layer);
							this.anim.removeLayer(mergeLayer);
							this.ui.update();
							modal.clear();
						}
					}));
				}

			}
		});

		return { tween, remove, startFrameIndex, endFrameIndex, lock, moveUp, moveToBack, addToGroup, merge, toEnd, highlight };
	}

	editModal() {
		
		const modal = new UIModal({
			title: `edit layer ${this.index}`, 
			ui: this.ui,
			callback: () => { this.ui.update(); }
		});

		const uis = this.getUIs(true);

		modal.add(uis.highlight);
		modal.add(uis.lock);
		
		modal.add(new UILabel({ text: "style" }));
		modal.add(new UINumberStep({
			value: this.layer.styleIndex,
			min: 0,
			max: this.anim.styles.length - 1,
			callback: value => {
				this.layer.styleIndex = value;
			},
		}));

		
		modal.addBreak();

		modal.addLabel("start");
		modal.add(uis.startFrameIndex);
		modal.addLabel("end");
		modal.add(uis.endFrameIndex);

		modal.addBreak();

		modal.add(uis.tween);
		modal.add(uis.toEnd);

		modal.addBreak();

		modal.add(uis.remove);
		modal.add(uis.merge);
		modal.add(uis.moveUp);
		modal.add(uis.moveToBack);
		modal.add(uis.addToGroup);

		modal.addBreak();

		modal.add(new UIButton({ 
			text: "cut segment",
			callback: () => {
				const drawing = this.anim.drawings[this.layer.drawingIndex];
				drawing.pop(); /* remove "end" */
				drawing.pop(); /* remove segment */
				drawing.add('end'); /* new end */
				this.layer.drawingEndIndex = drawing.length;
			}
		}));

		modal.add(new UIButton({
			text: "cut line",
			callback: () => {
				const drawing = this.anim.drawings[this.layer.drawingIndex];
				drawing.pop(); /* remove "end" */
				for (let i = drawing.length - 1; i > 0; i--) {
					if (drawing.get(i)[0] !== Points.END) drawing.pop();
					else break;
				}
				this.layer.drawingEndIndex = drawing.length;
			}
		}));

		modal.add(new UIButton({
			text: "separate last line",
			callback: () => {
				// this.lineToLayer(); 
				this.ui.panels.styles.reset();
				const layerDrawing = this.anim.drawings[layer.drawingIndex];
				this.anim.activeLayer.startFrame = layer.startFrame;
				this.anim.activeLayer.endFrame = layer.endFrame;
				const points = [layerDrawing.pop()]; // end
				const temp = []; // points added backwards
				for (let i = layerDrawing.length - 1; i > 0; i--) {
					const p = layerDrawing.pop();
					if (p !== Points.END) temp.push(p);
					else break;
				}
				for (let i = temp.length - 1; i > 0; i--) {
					this.anim.activeDrawing.add(temp[i]);
				}
				this.ui.panels.styles.reset();
				this.ui.update();
			}
		}));

		modal.add(new UIButton({
			text: "clone",
			callback: () => {
				const props = this.layer.getCloneProps();
				props.startFrame = props.endFrame = this.layer.endFrame + 1;
				this.anim.addLayer(new Layer(props));
				this.ui.panels.playback.setFrame(this.layer.endFrame + 1);
			}
		}));

		modal.add(new UIButton({
			text: "split",
			callback: () => {
				// move to layer mixin
				const props = this.layer.getCloneProps();
				props.startFrame = this.anim.currentFrame + 1;
				this.layer.endFrame = this.anim.currentFrame;
				this.anim.addLayer(new Layer(props));
				this.ui.panels.playback.setFrame(this.layer.endFrame + 1);
			}
		}));

		modal.add(new UIButton({
			text: 'clone drawing',
			callback: () => {
				const props = this.layer.getCloneProps();
				const drawing = this.anim.drawings[props.drawingIndex];
				const clone = new Drawing();
				clone.points = structuredClone(drawing.points);
				clone.offsets = structuredClone(drawing.offsets);
				// this.anim.drawings.pop();
				this.anim.drawings.push(clone);
				this.ui.panels.styles.reset();
			}
		}));

		modal.adjustPosition();
	}

	tweenModal() {

		const tween = {
			prop: 'endIndex',
			startFrame: this.anim.currentFrame,
			endFrame: this.anim.currentFrame + 10,
			startValue: 0,
			endValue: 'end'
		};

		const modal = new UIModal({
			title: 'Add Tween', 
			ui: this.ui, 
			callback: () => {
				if (tween.prop === 'endIndex' || tween.prop === 'startIndex') {
					if (tween.endValue === 'end') {
						tween.endValue = this.anim.drawings[this.layer.drawingIndex].length;
					}
					if (tween.startValue === 'end') {
						tween.startValue = this.anim.drawings[this.layer.drawingIndex].length;
					}
				}

				this.layer.addTween(tween);
				this.ui.update();
			}
		});

		modal.addBreak('Property:');
		modal.add(new UISelect({
			// redo props, add linesInterval 
			// interpolation?
			options: ['segmentNum', 'jiggleRange', 'wiggleRange', 'wiggleSpeed', 'linesInterval', 'startIndex', 'endIndex'],
			value: 'endIndex',
			selected: 'endIndex',
			callback: value => { tween.prop = value; }
		}));

		modal.addBreak('Start Frame:');
		modal.add(new UINumber({
			value: tween.startFrame,
			callback: value => { tween.startFrame = value; }
		}));

		modal.addBreak('End Frame:');
		modal.add(new UINumber({
			value: tween.endFrame,
			callback: value => { tween.endFrame = value; }
		}));

		modal.addBreak('Start Value:');
		modal.add(new UIText({
			value: tween.startValue,
			callback: value => { tween.startValue = value; }
		}));

		modal.addBreak('End Value:');
		modal.add(new UIText({
			value: tween.endValue,
			callback: value => { tween.endValue = value; }
		}));
	}
}