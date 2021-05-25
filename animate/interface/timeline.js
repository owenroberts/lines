function Timeline() {
	const self = this;
	this.frameWidth = 40;
	this.autoFit = false;
	this.viewLayers = true;
	this.viewActiveLayers = false;
	this.updateDuringPlay = false;

	this.init = function() {
		self.panel.el.addEventListener('wheel', ev => {
			ev.preventDefault();
			self.frameWidth += (ev.deltaY > 0 ? 1 : -1) * (ev.altKey ? 20 : 1);
			self.panel.timeline.setProp('--frame-width', self.frameWidth);
		});

		self.panel.el.addEventListener('mousedown', ev => {
			ev.preventDefault();
		});

		self.panel.el.addEventListener('mouseup', ev => {
			ev.preventDefault();
		});

		self.panel.el.addEventListener('mousemove', ev => {
			if (ev.which == 1 && ev.target.classList.contains('frame') && 
				lns.anim.currentFrame != +ev.target.textContent) {
				lns.draw.reset();
				lns.ui.play.setFrame(+ev.target.textContent);
				lns.ui.update();
			} else if (ev.which == 3) {
				// scroll right/left
			}
		});

		self.panel.el.oncontextmenu = function() {
  			return false;
		};
	};

	this.fit = function() {
		const f = lns.anim.endFrame + 1;
		const w = lns.ui.timeline.panel.el.clientWidth - 11; /* 11 for padding */
		self.frameWidth = (w - 2 * f) / f; 
		self.panel.timeline.setProp('--frame-width', self.frameWidth);

		// def better way to do this
		if (self.frameWidth < 5) {
			self.panel.timeline.addClass('five');
			self.panel.timeline.removeClass('ten');
		} else if (self.frameWidth < 10) {
			self.panel.timeline.addClass('ten');
			self.panel.timeline.removeClass('five');
		} else {
			self.panel.timeline.removeClass('ten');
			self.panel.timeline.removeClass('five');
		}
	};

	/* creates all the layer ui new each time */
	this.update = function() {

		lns.ui.faces.frameDisplay.value = lns.anim.currentFrame; // eek

		self.panel.timeline.setProp('--num-frames', lns.anim.endFrame + 1);
		self.panel.timeline.setProp('--num-tweens', lns.anim.layers.reduce((n, l) => n + l.tweens.length, 0));

		self.panel.timeline.clear();

		const numFrames = lns.anim.endFrame + 1;
		for (let i = 0; i < numFrames; i++) {
			const frameBtn = new UIButton({
				type: "frame",
				text: `${i}`,
				css: {
					gridColumnStart:  1 + (i * 2),
					gridColumnEnd:  3 + (i * 2)
				},
				class: i == lns.anim.currentFrame ? 'current' : '',
				callback: function() {
					lns.draw.reset();
					lns.ui.play.setFrame(i);
					lns.ui.update();
				}	
			});
			// lns.ui.keys[i] = frameBtn;
			self.panel.timeline.append(frameBtn, `frm-${i}`);
		}
		
		if (self.updateDuringPlay || !lns.anim.isPlaying) this.drawLayers();
	};

	this.drawLayers = function() {

		if (self.viewLayers) {
			const layers = self.viewActiveLayers ?
				lns.anim.layers.filter(layer => layer.isInFrame(lns.anim.currentFrame)) :
				lns.anim.layers;

			self.panel.timeline.setProp('--num-layers', layers.length - 1);

			let gridRowStart = 2;
			let gridRowEnd = 3;
			for (let i = 0; i < layers.length - 1; i++) {
				const layer = layers[i];
				if (layer.isToggled) layer.toggle();  // for rebuilding interface constantly
				const ui = new UILayer({
					type: 'layer',
					css: {
						gridRowStart: gridRowStart, // 2 + (i * 2),
						gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
						gridColumnStart: layer.startFrame * 2 + 1,
						gridColumnEnd: layer.endFrame * 2 + 3
					},
					callback: function() {
						// only update the values when toggling on, ignore when toggling off
						if (!layer.isToggled) lns.draw.setProperties(layer.getEditProps());
						layer.toggle();
					}
				}, layer);
				
				
				gridRowStart += 2;
				gridRowEnd += 2;
				self.panel.timeline.append(ui, `layer-${i}`);

				/* add tweens -- add methods like getTweens */
				for (let j = 0; j < layer.tweens.length; j++) {
					const tween = layer.tweens[j];
					const tweenUI = new UITween({
						type: 'tween',
						css: {
							gridRowStart: gridRowStart, 
							gridRowEnd: gridRowEnd, 	
							gridColumnStart: tween.startFrame * 2 + 1,
							gridColumnEnd: tween.endFrame * 2 + 3
						},
					}, tween, layer);
					
					self.panel.timeline.append(tweenUI, `tween-${j}-layer-${i}`);
					
					gridRowStart += 2;
					gridRowEnd += 2;
				}
			}
		} else {
			self.panel.timeline.setProp('--num-layers', 0);
		}

		if (self.autoFit) self.fit();
	};

	this.toggleViewLayers = function() {
		self.viewLayers = !self.viewLayers;
		self.update();
	};

	this.toggleViewActiveLayers = function() {
		self.viewActiveLayers = !self.viewActiveLayers;
		self.update();
	};

	this.split = function() {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				/* this is repeated in ui layer */
				const props = layer.getCloneProps();
				props.startFrame = lns.anim.currentFrame + 1;
				lns.anim.addLayer(new Layer(props));
				layer.endFrame = lns.anim.currentFrame;
			}
		}
		lns.ui.play.setFrame(lns.anim.currentFrame + 1);
	};

	// select in frame
	this.select = function() {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				if (!layer.isToggled) {
					self.panel.timeline[`layer-${i}`].toggle.handler(); // this is weird
				}
			}
		}
	};

	// select all
	this.selectAll = function() {
		const allToggled = lns.anim.layers.filter(layer => layer.isToggled).length == lns.anim.layers.length - 1;
		
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (allToggled && layer.isToggled) {
				self.panel.timeline[`layer-${i}`].toggle.on();
				lns.anim.layers[i].toggle();
			} else if (!layer.isToggled) {
				lns.anim.layers[i].toggle();
				self.panel.timeline[`layer-${i}`].toggle.off(); // this is weird
			}
		}
	};

}