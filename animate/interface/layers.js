function Layers() {
	const self = this;
	this.layers = [];

	this.updateProperty = function(prop, value) {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) self.layers[i][prop] = value;
		}
	};

	this.resetLayers = function() {
		for (let i = self.layers.length - 1; i >= 0; i--) {
			if (self.layers[i].toggled) self.layers[i].toggle();
		}
		for (let i = this.panel.rows.length - 1; i > 1; i--) {
			this.panel.removeRow(this.panel.rows[i]);
		}
		self.layers = [];
	};

	/* z */
	this.cutLayerSegment = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) {
				const drawing = lns.anim.drawings[self.layers[i].d];
				drawing.pop(); /* remove "end" */
				drawing.pop(); /* remove segment */
				drawing.push('end'); /* new end */
				self.layers[i].e = drawing.length; /* update layer end num */
			}
		}
	};

	/* shift z */
	this.cutLayerLine = function() {
		for (let i = 0; i < self.layers.length; i++) {
			if (self.layers[i].toggled) {
				const drawing = lns.anim.drawings[self.layers[i].d];
				drawing.pop(); /* remove "end" */
				for (let i = drawing.length - 1; i > 0; i--) {
					if (drawing[i] != 'end') drawing.pop();
					else break;
				}
				self.layers[i].e = drawing.length; /* update layer end num */
			}
		}
	};

	this.updateLayerColor = function(color) {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			if (layer.toggled && layer.isInFrame(lns.anim.currentFrame)) {
				layer.c = layer.prevColor = color;
			}
		}
	};

	this.clone = function() { 
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			if (layer.toggled) {
				layer.toggle();
				layer.ui.toggle.on(); /* ick */
				
				const n = new Layer(_.cloneDeep(layer));
				delete n.ui;
				n.startFrame = n.endFrame = layer.endFrame + 1;
				lns.anim.layers.push(n);
				self.update();
				layer.ui.update();
				n.ui.update();
				lns.ui.setFrame(layer.endFrame + 1);
			}
		}
	};

	this.split = function() { 
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			if (layer.toggled && layer.isInFrame(lns.anim.currentFrame)) {
				layer.toggle();
				layer.ui.toggle.on(); /* ick */
				const n = new Layer(_.cloneDeep(layer), lns.anim.layers.length);
				n.startFrame = lns.anim.currentFrame + 1;
				delete n.ui;
				layer.endFrame = lns.anim.currentFrame;
				lns.anim.layers.push(n);
				self.update();
				n.ui.update();
				layer.ui.update();
				lns.ui.setFrame(layer.endFrame + 1);
			}
		}
	};

	this.addAnimation = function() {

		const a = {
			prop: 'e',
			sf: lns.anim.currentFrame,
			ef: lns.anim.currentFrame + 10,
			sv: 0,
			ev: 'end'
		};

		console.log(this.position);

		const modal = new UIModal('Add Animation', lns, this.position, function() {
			for (let i = 0; i < lns.anim.layers.length; i++) {
				const layer = lns.anim.layers[i];
				if (layer.toggled) {
					if (a.ev == 'end') a.ev = lns.anim.drawings[layer.d].length;
					layer.addAnimation(a);
					layer.ui.update();
					layer.ui.addAnimation(a);
					layer.toggle();
					layer.ui.toggle.on(); /* ick */
					lns.ui.updateInterface();
				}
			}
		});

		modal.add(new UILabel({ text: 'Property:' }));
		modal.add(new UISelect({
			options: ['e', 's', 'n', 'r', 'w', 'v'],
			value: 'e',
			selected: 'e',
			callback: function(value) {
				a.prop = value;
			}
		}));

		modal.add(new UILabel({ text: 'Start:' }));

		modal.add(new UIBlur({
			value: a.sf,
			callback: function(value) {
				a.sf = +value;
			}
		}));

		modal.add(new UILabel({ text: 'End:' }));
		modal.add(new UIBlur({
			value: a.ef,
			callback: function(value) {
				a.ef = +value;
			}
		}));

		modal.add(new UILabel({ text: 'Begin:' }));
		modal.add(new UIBlur({
			value: a.sv,
			callback: function(value) {
				a.sv = +value;
			}
		}));

		modal.add(new UILabel({ text: 'End:' }));
		modal.add(new UIBlur({
			value: a.ev,
			callback: function(value) {
				a.ev = +value;
			}
		}));
	};

	this.selectedAll = false;
	this.selectAll = function() {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				if (layer.toggled != self.selectedAll) layer.toggle();
				layer.toggle();
			}
		}
		self.selectedAll = !self.selectedAll;
	};

	this.addUI = function(layer, index) {
		layer.ui = new UILayer({
			type: 'layer',
			index: index,
			callback: layer.toggle.bind(layer)
		}, layer);
		self.panel.layers.append(layer.ui);
	};

	this.update = function() {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			if (!layer.ui) self.addUI(layer, i);
		}
	};
}