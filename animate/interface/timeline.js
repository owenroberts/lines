function Timeline() {
	const self = this;
	this.frameSize = 40;

	this.init = function() {
		self.panel.el.addEventListener('wheel', ev => {
			ev.preventDefault();
			self.frameSize += ev.deltaY > 0 ? 1 : -1;
			self.panel.timeline.setProp('--frame-size', self.frameSize);
		});

		self.panel.el.addEventListener('mousedown', ev => {
			ev.preventDefault();
			// console.log('mousedown');
		});

		self.panel.el.addEventListener('mouseup', ev => {
			ev.preventDefault();
			// console.log('mouseup');
			// console.log(ev);
			// console.log(ev.target);
			// console.log(ev.which);
		});

		self.panel.el.addEventListener('mousemove', ev => {
			if (ev.which == 1 && ev.target.classList.contains('frame') && 
				lns.anim.currentFrame != +ev.target.textContent) {
				lns.draw.reset();
				lns.ui.play.setFrame(+ev.target.textContent);
				lns.ui.update();
			}
		});

		self.panel.el.oncontextmenu = function() {
  			return false;
		};
	};

	this.fit = function() {
		const f = lns.anim.endFrame + 1;
		const w = lns.ui.timeline.panel.el.clientWidth - 11; /* 11 for padding */
		self.frameSize = (w - 2 * f) / f; 
		self.panel.timeline.setProp('--frame-size', self.frameSize);
	};

	this.update = function() {
		// self.panel.timeline.setProp('--frame-size', 40); /* can't get computerd style */
		self.panel.timeline.setProp('--num-frames', lns.anim.endFrame + 1);
		self.panel.timeline.setProp('--num-layers', lns.anim.layers.length);

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



		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			const ui = new UILayer({
				type: 'layer',
				css: {
					gridRowStart: 2 + (i * 2),
					gridRowEnd: 3 + (i * 2),
					gridColumnStart: layer.startFrame * 2 + 1,
					gridColumnEnd: layer.endFrame * 2 + 3
				},
				callback: function() {
					layer.toggle();
					lns.draw.setProperties(layer.props);
				}
			}, layer);
			// console.log(ui);
			self.panel.timeline.append(ui, `lyr-${i}`);
		}
	};
}