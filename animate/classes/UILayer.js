class UILayer extends UICollection {
	constructor(layer, params) {
		super(params);
		this.addClass('layer');
		this.layer = layer;
		if (params.canMoveUp) this.canMoveUp = params.canMoveUp;
		const width = params.width;

		const toggle = new UIToggle({
			type: 'layer-toggle',
			class: 'timeline-btn',
			text: `${layer.drawingIndex}`,
			isOn: layer.isToggled,
			callback: value => {
				// better way to do this annoying long line?
				layer.isToggled = value;
				// set properties
				if (layer.isToggled && params.setLinesProperties) params.setLinesProperties(); 
				highlight.update(layer.isToggled);
			}
		});

		const highlight = new UIToggle({
			type: 'layer-highlight',
			class: 'timeline-btn',
			text: '*',
			isOn: layer.isHighlighted,
			callback: value => {
				layer.isHighlighted = value;
			}
		});

		const edit = new UIButton({
			type: 'layer-edit',
			class: 'timeline-btn',
			text: "E",
			callback: () => {
				this.editModal(layer, params);
			}
		});

		if (params.group) {
			this.groupLabel = new UILabel({ text: params.group });
		}

		const uis = this.getPropUIs(layer, params, false);

		if (width > 40) this.append(uis.startFrameNumber);
		this.append(toggle);
		this.append(highlight);
		if (width > 20) this.append(edit);
		if (width > 50) this.append(uis.lock);
		if (width > 60) this.append(uis.tween);
		if (width > 70) this.append(uis.remove);
		if (width > 80) this.append(uis.addToGroup);
		if (width > 90 && this.canMoveUp) this.append(uis.moveUp);
		if (width > 100 && this.groupLabel) this.append(this.groupLabel);

		// has to go last
		if (width > 80) {
			this.append(uis.endFrameNumber);
			uis.endFrameNumber.addClass('right-margin');
		}
	}

	getPropUIs(layer, params, isModal) {

		const uis = {};
		const btnClass = isModal ? 'btn' : 'timeline-btn';

		uis.tween = new UIButton({
			text: isModal ? "Add Tween" : "T",
			class: btnClass,
			type: 'layer-tween',
			callback: () => {
				this.tweenModal(layer);
			}
		});

		uis.remove = new UIButton({
			type: 'remove',
			text: isModal ? "Remove" : "X",
			class: btnClass,
			callback: () => {
				lns.anim.removeLayer(layer);
				lns.ui.update();
			}
		});

		uis.startFrameNumber = new UINumberStep({
			value: layer.startFrame,
			class: isModal ? '' : btnClass,
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

		uis.endFrameNumber = new UINumberStep({
			value: layer.endFrame,
			class: isModal ? '' : btnClass,
			min: 0,
			callback: value => {
				layer.endFrame = +value;
				if (+value < layer.startFrame) {
					layer.startFrame = +value;
				}
				lns.ui.update();
			}
		});

		uis.lock = new UIToggle({
			type: 'layer-lock',
			text: isModal ? 'Lock' : 'L',
			class: btnClass,
			isOn: layer.isLocked,
			callback: function(value) {
				layer.isLocked = value;
			}
		});

		uis.moveUp = new UIButton({
			text: isModal ? "Move Up" : '^',
			type:'move-up',
			class: btnClass,
			callback: params.moveUp
		});

		uis.addToGroup = new UIButton({
			text: isModal ? 'Add to Group' : 'G',
			type: 'add-to-group',
			class: btnClass,
			callback: () => {
				params.addToGroup(this.position); // cant get position, node from original is gone?
			}
		});

		return uis;
	}

	editModal(layer, params) {
		const modal = new UIModal({
			title: 'Edit Layer', 
			app: lns, 
			position: this.position, 
			callback: () => { lns.ui.update(); }
		});

		const uis = this.getPropUIs(layer, params, true);
		for (const k in uis) {
			if (k === 'startFrameNumber') modal.addBreak("Start Frame:");
			if (k === 'endFrameNumber') modal.addBreak("End Frame:");
			modal.add(uis[k]);
			if (k === 'endFrameNumber') modal.addBreak();
		}

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
			text: "Clone Layer",
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

		modal.adjustPosition();
	}

	tweenModal(layer) {

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
				tween.endValue = lns.anim.drawings[layer.drawingIndex].length;
				layer.addTween(tween);
				lns.ui.update();
			}
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
}