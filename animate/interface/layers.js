function Layers() {
	const self = this;

	this.loop = function(callback) {
		/* -1 to not show draw layer */
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].toggled) 
				callback(lns.anim.layers[i], i);
		}
	};
	
	this.updateProperty = function(prop, value) {
		self.loop(layer => { layer[prop] = value; });
	};

	this.cutLayerSegment = function() {
		self.loop(layer => {
			const drawing = lns.anim.drawings[layer.d];
			drawing.pop(); /* remove "end" */
			drawing.pop(); /* remove segment */
			drawing.push('end'); /* new end */
		})
	}; 	/* z */ 
	
	this.cutLayerLine = function() {
		self.loop(layer => {
			const drawing = lns.anim.drawings[layer.d];
			drawing.pop(); /* remove "end" */
			for (let i = drawing.length - 1; i > 0; i--) {
				if (drawing[i] != 'end') drawing.pop();
				else break;
			}
		});
	}; /* shift z */
	
	this.clone = function() { 
		self.loop((layer, index) => {
			self.panel.layers[index].toggle.toggle();
			layer.toggle();
			const newLayer = new Layer(_.cloneDeep(layer));
			newLayer.startFrame = newLayer.endFrame = layer.endFrame + 1;
			lns.anim.layers.splice(lns.anim.layers.length - 1, 0, newLayer);
			self.update();
			lns.ui.setFrame(layer.endFrame + 1);
		});
	}; /* test ? */

	this.split = function() { 
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
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

	this.addTween = function() {

		const tween = {
			prop: 'e',
			sf: lns.anim.currentFrame,
			ef: lns.anim.currentFrame + 10,
			sv: 0,
			ev: 'end'
		};

		const modal = new UIModal('Add Animation', lns, this.position, function() {
			self.loop((layer, index) => {
				if (tween.ev == 'end') 
					tween.ev = lns.anim.drawings[layer.d].length;
					layer.addTween(tween);
					layer.toggle();
					self.panel.layers[index].toggle.toggle();
					lns.ui.update();
			});
		});

		modal.add(new UILabel({ text: 'Property:' }));
		modal.add(new UISelect({
			options: ['e', 's', 'n', 'r', 'w', 'v'],
			value: 'e',
			selected: 'e',
			callback: function(value) {
				tween.prop = value;
			}
		}));

		modal.add(new UILabel({ text: 'Start:' }));

		modal.add(new UIBlur({
			value: tween.sf,
			callback: function(value) {
				tween.sf = +value;
			}
		}));

		modal.add(new UILabel({ text: 'End:' }));
		modal.add(new UIBlur({
			value: tween.ef,
			callback: function(value) {
				tween.ef = +value;
			}
		}));

		modal.add(new UILabel({ text: 'Begin:' }));
		modal.add(new UIBlur({
			value: tween.sv,
			callback: function(value) {
				tween.sv = +value;
			}
		}));

		modal.add(new UILabel({ text: 'End:' }));
		modal.add(new UIBlur({
			value: tween.ev,
			callback: function(value) {
				tween.ev = +value;
			}
		}));
	}; /* alt - a */

	this.selectedAll = false;
	this.selectAll = function() {
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				if (layer.toggled != self.selectedAll) {
					layer.toggle();
					self.panel.layers[i].toggle.toggle();
				}
				layer.toggle();
				self.panel.layers[i].toggle.toggle();
			}
		}
		self.selectedAll = !self.selectedAll;
	};

	this.update = function() {

		// is this crazy ? 
		self.panel.layers.el.style.width = `${lns.ui.list[0].el.getBoundingClientRect().width * (lns.anim.endFrame + 1)}px`
		
		/* -1 to not show draw layer */
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (!self.panel.layers[i]) {
				const ui = new UILayer({
					type: 'layer',
					index: i,
					callback: function() {
						layer.toggle();
						lns.draw.setProperties(layer.props);
					}
				}, layer);
				self.panel.layers.append(ui, i);
			} else {
				self.panel.layers[i].update();
			}
		}
	};

	this.remove = function(_index) {
		const index = _index !== undefined ? _index : prompt('Layer number?');
		lns.anim.layers.splice(index, 1);
		self.panel.layers.removeK(index);
	};  /* alt d */

	this.removeSelected = function() {
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			const layer = lns.anim.layers[i];
			if (layer.toggled) self.remove(i);
		}
	};

	this.clear = function() {
		self.panel.layers.clear();
	};
}