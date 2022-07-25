class UITimelineGroup extends UICollection {
	constructor(layers, params) {
		super(params);
		this.index = params.index;
		this.layers = layers;
		this.addClass('group');
		this.startFrame = params.startFrame;
		this.endFrame = params.endFrame;
		const width = params.width;

		this.isToggled = false;
		const self = this;

		const toggle = new UIToggle({
			type: 'group-toggle',
			class: 'timeline-btn',
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
			type: 'group-highlight',
			class: 'timeline-btn',
			text: '*',
			isOn: false,
			callback: value => {
				layers.forEach(layer => {
					layer.isHighlighted = value;
				});
			}
		});

		const edit = new UIButton({
			type: 'layer-edit',
			class: 'timeline-btn',
			text: "E",
			callback: () => {
				this.editModal(layers, params);
			}
		});

		const uis = this.getPropUIs(layers, params, false);

		if (width > 30) this.append(uis.startFrameNumber);
		this.append(toggle);
		this.append(highlight);
		if (width > 20) this.append(edit);
		if (width > 50) this.append(uis.lock);
		if (width > 60) this.append(uis.breakUp);
		if (width > 70) this.append(uis.removeLayer);

		if (width > 80) {
			this.append(uis.endFrameNumber);
			uis.endFrameNumber.addClass('right-margin');
		}
	}

	getPropUIs(layers, params, isModal) {

		const uis = {};
		const btnClass = isModal ? 'btn' : 'timeline-btn';		

		uis.lock = new UIToggle({
			type: 'group-lock',
			text: isModal ? 'Lock' : 'L',
			class: btnClass,
			isOn: false,
			callback: function() {
				layers.forEach(layer => {
					layer.isLocked = !layer.isLocked;
				});
			}
		});

		uis.breakUp = new UIButton({
			type: 'group-breakup',
			class: btnClass,
			text: isModal ? 'Break up' : 'X',
			callback: function() {
				layers.forEach(layer => {
					layer.groupNumber = -1;
				});
				lns.ui.update();
			}
		});

		uis.removeLayer = new UIButton({
			type: 'group-remove-layer',
			class: btnClass,
			text: isModal ? 'Remove Layer' : 'R',
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

		uis.startFrameNumber = new UINumberStep({
			value: this.startFrame,
			class: isModal ? '' : btnClass,
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

		uis.endFrameNumber = new UINumberStep({
			value: this.endFrame,
			class: isModal ? '' : btnClass,
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

		return uis;
	}

	editModal(layers, params) {

		const modal = new UIModal({
			title: 'Edit Group', 
			app: lns, 
			position: this.position, 
			callback: () => {
				lns.ui.update();
			}
		});

		const uis = this.getPropUIs(layers, params, true);
		for (const k in uis) {
			if (k === 'startFrameNumber') modal.addBreak("Start Frame:");
			if (k === 'endFrameNumber') modal.addBreak("End Frame:");
			modal.add(uis[k]);
		}

		modal.adjustPosition();	
	}
}