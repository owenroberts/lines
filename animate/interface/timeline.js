function Timeline() {
	const self = this;
	this.frameWidth = 40;
	this.autoFit = false;
	this.viewLayers = true;
	this.viewActiveLayers = false;
	this.updateDuringPlay = false;
	this.useScrollToFrame = true;

	this.init = function() {
		self.panel.el.addEventListener('wheel', ev => {
			ev.preventDefault();
			if (ev.shiftKey) {
				let tl = self.panel.timeline.el;
				let x = tl.scrollLeft;
				tl.scrollTo(x + 20 * Math.sign(ev.deltaX), 0);
				return;
			}

			self.frameWidth += (ev.deltaY > 0 ? 1 : -1) * (ev.altKey ? 5 : 1);
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
		self.frameClass();
	};

	this.frameClass = function() {
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

	this.fitFrame = function() {
		lns.ui.faces.timelineAutoFit.off(); // better toggle setup ??
		self.autoFit = false;
		self.frameWidth = 120;
		self.panel.timeline.setProp('--frame-width', self.frameWidth);
		self.frameClass();
		self.update();
		self.scrollToFrame();
	};

	this.scrollToFrame = function() {
		if (!self.useScrollToFrame) return;
		self.panel.timeline.el.scrollTo(lns.ui.panels.timeline.timeline[`frm-${lns.anim.currentFrame}`].el.offsetLeft - 10, 0);
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
		self.scrollToFrame();
	};

	this.drawLayers = function() {

		if (self.viewLayers) {
			const layers = self.viewActiveLayers ?
				lns.anim.layers.filter(layer => layer.isInFrame(lns.anim.currentFrame)) :
				lns.anim.layers;

			self.panel.timeline.setProp('--num-layers', layers.length - 1);

			let gridRowStart = 2;
			let gridRowEnd = 3;
			for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
				const layer = lns.anim.layers[i];
				if (self.viewActiveLayers && !layer.isInFrame(lns.anim.currentFrame)) continue;
				if (layer.isToggled) layer.toggle();  // for rebuilding interface constantly
				const ui = new UILayer({
					type: 'layer',
					width: self.frameWidth,
					css: {
						gridRowStart: gridRowStart, // 2 + (i * 2),
						gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
						gridColumnStart: layer.startFrame * 2 + 1,
						gridColumnEnd: layer.endFrame * 2 + 3
					},
					moveUp: function() {
						const swapIndex = lns.anim.layers.indexOf(layers[i - 1]);
						const layerIndex = lns.anim.layers.indexOf(layer);
						if (swapIndex >= 0) {
							[lns.anim.layers[swapIndex], lns.anim.layers[layerIndex]] = [lns.anim.layers[layerIndex], lns.anim.layers[swapIndex]]
						}
						self.update();
					}
				}, layer, i > 0 && layers.length > 2);
				
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

	// select all layers in frame
	this.select = function(isSelect) {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame) && layer.isToggled !== isSelect) {
				self.panel.timeline[`layer-${i}`].toggle.update(isSelect);
			}
		}
	};

	this.deselect = function() {
		self.select(false);
	};

	this.lock = function(isLock) {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame) && layer.isLocked !== isLock) {
				self.panel.timeline[`layer-${i}`].lock.update(isLock);
			}
		}
	};

	this.unlock = function() {
		self.lock(false);
	};

}