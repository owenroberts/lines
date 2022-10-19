function Render(dps=30, showStats=false) {
	
	// this.showStats = showStats;
	// this.dps = dps || 30; // draws pers second
	window.drawCount = 0; // everything has this... use Lines.drawCount??

	let interval = 1000 / this.dps;  // time interval between draws
	let timer = performance.now();

	let onionSkinNum = 0; /* l key */
	let onionSkinIsVisible = false; /* n key */

	let clearCount = 0; // what is this -- lol
	let clearCountInterval = 0;

	let stats, playPanel;

	function toggleStats(value) {
		if (value !== undefined) showStats = value;

		if (!stats && showStats) {
			stats = new Stats();
			stats.dom.style.position = 'absolute';
			stats.dom.style.top = '-48px';
			stats.dom.style.right = '0';
			stats.dom.style.left = 'auto';
			playPanel.el.appendChild(lns.render.stats.dom);
		} 
		
		if (stats) {
			stats.dom.style.display = showStats ? 'block' : 'none';
		}
	}

	/* just set drawing back to 0 but might do other things */
	function reset() {
		lns.anim.frame = 0;
		lns.anim.isPlaying = false;
		// lns.canvas.ctx.miterLimit = 1; /* maybe not needed? happens in canvas reset*/
		lns.ui.update();
	}

	function toggle() {
		if (!lns.anim.isPlaying) {
			lns.ui.play.checkEnd();
			lns.draw.reset();
		} else {
			lns.draw.layer.startFrame = lns.draw.layer.endFrame = lns.anim.currentFrame;
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
		lns.ui.timeline.update();
	}

	/* ' - dps is property of render engine, not individual animations */
	function setDPS(value) {
		dps = value;
		interval = 1000 / dps;
		// keep fps constant
		lns.anim.drawsPerFrame = Math.max(1, Math.round(+dps / lns.anim.fps));
		lns.ui.faces.fps.value = lns.anim.fps;
		lns.ui.faces.dpf.value = lns.anim.dpf;
	}

	/* ; - fps update frame value in anim*/
	function setFPS(value) {
		lns.anim.fps = value;
		lns.ui.faces.fps.value = lns.anim.fps;
		lns.ui.faces.dpf.value = lns.anim.dpf;
	}

	function setDPF(value) {
		lns.anim.dpf = +value;
		lns.ui.faces.fps.value = lns.anim.fps;
	}

	function update(time) {
		if (showStats) stats.begin();
		if (performance.now() > interval + timer || time == 'cap') {
			timer = performance.now();

			// what actually need to be update here ?
			if (lns.anim.isPlaying) lns.ui.timeline.update();

			if (clearCount === clearCountInterval) {
				/*
					this is where "this" is useful, this becomes
					canvas.getWidth(), canvas.getHeight()
					or lns.ui.faces.width, lns.ui.faces.height ... 
				*/
				lns.canvas.ctx.clearRect(0, 0, lns.canvas.width, lns.canvas.height);
				clearCount = 0;
			} else {
				clearCount++;
			}

			/* in capture set animation onDraw 
				move this logic to capture
			*/
			if (lns.ui.capture.bg && (lns.ui.capture.frames > 0 || lns.ui.capture.isVideo)) {
				lns.canvas.ctx.fillStyle = lns.canvas.bgColor;
				lns.canvas.ctx.fillRect(0, 0, lns.canvas.width, lns.canvas.height);
			}

			lns.bgImage.display(); // part of canvas module?

			// onion skin
			if (onionSkinNum > 0 && onionSkinIsVisible) {
				const temp = lns.anim.currentFrame;
				for (let o = 1; o <= onionSkinNum; o++){
					const index = temp - o;
					if (index >= 0) {
						lns.anim.currentFrame = index;
						lns.anim.overrideProperty(
							'color', 
							`rgba(105,150,255,${ 1.5 - (o / onionSkinNum) })`
						);
						/* 
							this triggers capture, turn off onion skin for clean capture  -- think i did this?
						*/
						lns.anim.draw();
					}
				}
				lns.anim.cancelOverride();
				lns.anim.currentFrame = temp;
			}

			// highlight
			// difficulty of making this generic .. think about
			if (lns.anim.layers.some(l => l.isHighlighted)) {
				lns.anim.overrideProperty('color', '#94dfe3');
				for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
					const layer = lns.anim.layers[i];
					if (!layer.isInFrame(lns.anim.currentFrame) || !layer.isHighlighted) {
						layer.dontDraw = true;
					}
				}
				lns.canvas.ctx.lineWidth = 5; // set through ui or make it a class
				lns.anim.draw(0, 0, true);
				lns.anim.cancelOverride();
				lns.canvas.ctx.lineWidth = lns.canvas.lineWidth;
				lns.anim.layers.filter(l => l.dontDraw).forEach(l => {
					l.dontDraw = false;
				});
			}

			lns.anim.update();
			lns.anim.draw();
			window.drawCount++;
		}
		if (!lns.ui.capture.isCapturing) 
			window.requestAnimFrame(self.update);
		if (showStats) stats.end();
	}

	function start() {
		window.requestAnimFrame(update);
	}

	function connect() {
		
		playPanel = lns.ui.getPanel('play', { label: 'Play Back'});

		lns.ui.addCallbacks([
			{ callback: toggle, "onText": "❚❚", "offText": "▶", key: 'space' },
			{ callback: update, "text": "↻", key: 'u' },
		]);

		lns.ui.addProps({
			'fps': {
				type: 'UINumberStep',
				key: ";",
				value: fps,
				callback: value => { setFPS(value); }
				min: 1,
				prompt: 'Set Frames/Second',
			},
			'dpf': {
				type: 'UINumberStep',
				value: dpf,
				callback: value => { setDPF(value); }
				min: 1,
				prompt: 'Set Draws/Frame',
			},
			'dps': {
				type: 'UINumberStep',
				key: "'",
				value: dps,
				callback: value => { setDPS(value); }
				prompt: 'Set Draw/Second',
			},
			'onionSkinIsVisible': {
				type: 'UIToggleCheck',
				value: onionSkinIsVisible,
				text: 'Onion Skin',
				key: 'n',
				callback: value => { onionSkinIsVisible = value; }
			},
			'onionSkinNum': {
				type: 'UINumberStep',
				value: onionSkinNum,
				key: 'l',
				callback: value => { onionSkinNum = value;}
			},
			'viewStats': {
				type: 'UIToggleCheck',
				value: showStats,
				callback: value => { toggleStats(value); }
			},
		});
	}

	return { connect, reset, start };
}