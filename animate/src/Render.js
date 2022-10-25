function Render(dps=30, showStats=false) {
	
	// this.showStats = showStats;
	// this.dps = dps || 30; // draws pers second
	window.drawCount = 0; // everything has this... use Lines.drawCount??

	let interval = 1000 / dps;  // time interval between draws
	let timer = performance.now();

	let onionSkinNum = 0; /* l key */
	let onionSkinIsVisible = false; /* n key */

	let clearCount = 0; // what is this -- lol
	let clearCountInterval = 0;

	let stats, playPanel, frameDisplay;

	function toggleStats(value) {
		if (value !== undefined) showStats = value;

		if (!stats && showStats) {
			stats = new Stats();
			stats.dom.style.position = 'absolute';
			stats.dom.style.top = '-48px';
			stats.dom.style.right = '0';
			stats.dom.style.left = 'auto';
			playPanel.el.appendChild(stats.dom);
		} 
		
		if (stats) {
			stats.dom.style.display = showStats ? 'block' : 'none';
			playPanel.setProp('overflow', 'visible');
		} else {
			playPanel.setProp('overflow', 'hidden');
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
			checkEnd();
			lns.draw.reset();
		} else {
			const layer = lns.draw.getDrawLayer();
			layer.startFrame = lns.anim.currentFrame;
			layer.endFrame = lns.anim.currentFrame;
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
		lns.timeline.update();
	}

	/* ' - dps is property of render engine, not individual animations */
	function setDPS(value) {
		dps = value;
		interval = 1000 / dps;
		// keep fps constant
		lns.anim.drawsPerFrame = Math.max(1, Math.round(dps / lns.anim.fps));
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
		lns.anim.dpf = value;
		lns.ui.faces.fps.value = lns.anim.fps;
	}

	function setFrame(f) {
		if (+f <= lns.anim.endFrame + 1 && +f >= 0) {
			// no before ?? 
			if (lns.anim.frame !== +f) lns.draw.reset();
			lns.anim.frame = +f;

			lns.draw.getDrawLayer().startFrame = lns.anim.currentFrame;
			lns.draw.getDrawLayer().endFrame = lns.anim.currentFrame;
			
			lns.ui.update();
		} else {
			frameDisplay.update(lns.anim.currentFrame, true);
		}
	}

	// fix for playing animation with nothing in the final frame
	function checkEnd() {
		if (lns.anim.currentFrame === lns.anim.endFrame && !lns.draw.hasDrawing()) {
			next(-1);
		}
	}

	/* call before changing a frame */
	function next(dir) {

		const next = lns.anim.currentFrame + dir;
		
		if (lns.anim.isPlaying) lns.ui.faces.play.update(); // ?
		// lns.draw.isDrawing = false; /* prototype here with render, anim, draw, isActive or something ? */
		lns.draw.stop();
		
		if (lns.draw.getCurrentDrawing().length > 0) {
			// drawing to save - can add frame
			lns.draw.reset(next);
			lns.anim.frame = next;
		} else {
			// put in reset? 
			const layer = lns.draw.getDrawLayer();
			if (dir > 0) {
				if (lns.anim.currentFrame < lns.anim.state.end || 
					(lns.anim.stateName == 'default' && lns.draw.hasDrawing())) {
					layer.startFrame = next;
					layer.endFrame = next;	
					lns.anim.frame = next;
				}
			}

			if (dir < 0 && lns.anim.currentFrame > lns.anim.state.start) {
				layer.startFrame = next;
				layer.endFrame = next;
				lns.anim.frame = next;
			}
		}

		lns.data.saveState();
		lns.ui.update();
	}

	function plus() {
		setFrame(lns.anim.endFrame);
		next(1);
	}

	function update(time) {
		if (showStats) stats.begin();
		if (performance.now() > interval + timer || time == 'cap') {
			timer = performance.now();

			// what actually need to be update here ?
			if (lns.anim.isPlaying) lns.timeline.update();

			if (clearCount === clearCountInterval) {
				/*
					this is where "this" is useful, this becomes
					canvas.getWidth(), canvas.getHeight()
					or lns.ui.faces.width, lns.ui.faces.height ... 
				*/
				lns.canvas.ctx.clearRect(0, 0, lns.canvas.getWidth(), lns.canvas.getHeight());
				clearCount = 0;
			} else {
				clearCount++;
			}

			/* in capture set animation onDraw 
				move this logic to capture
			*/
			if (lns.capture.bg && (lns.capture.frames > 0 || lns.capture.isVideo)) {
				lns.canvas.ctx.fillStyle = lns.canvas.getBGColor();
				lns.canvas.ctx.fillRect(0, 0, lns.canvas.getWidth(), lns.canvas.getHeight());
			}

			lns.bg.display(); // part of canvas module?

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
				lns.canvas.ctx.lineWidth = lns.canvas.getLineWidth();
				lns.anim.layers.filter(l => l.dontDraw).forEach(l => {
					l.dontDraw = false;
				});
			}

			lns.anim.update();
			lns.anim.draw();
			window.drawCount++;
		}
		if (!lns.capture.isCapturing()) window.requestAnimFrame(update);
		if (showStats) stats.end();
	}

	function start() {
		window.requestAnimFrame(update);
	}

	function connect() {
		
		playPanel = lns.ui.getPanel('play', { label: 'Play Back'});

		lns.ui.addCallbacks([
			{ callback: setFrame, key: '0', text: '0', args: [0] },
			{ callback: next, key: 'w', text: '<', args: [-1] },
			// play btn
			{ callback: toggle, type: 'UIToggle', value: false, text: 'Play', "onText": "❚❚", "offText": "▶", key: 'space' },
			{ callback: next, key: 'e', text: '>', args: [1] },
			{ callback: plus, key: '+', text: '+'}
		], 'play');
	
		frameDisplay = lns.ui.addUI({ 
			type: "UINumberStep",
			callback: setFrame, 
			face: 'frameDisplay',
			key: 'f',
			value: 0,
		}, 'play');

		lns.ui.addCallbacks([
			{ callback: update, "text": "↻", key: 'u' },
		]);

		lns.ui.addProps({
			'fps': {
				type: 'UINumberStep',
				key: ";",
				value: lns.anim.fps,
				callback: value => { setFPS(value); },
				min: 1,
				prompt: 'Set Frames/Second',
			},
			'dpf': {
				type: 'UINumberStep',
				value: lns.anim.dpf,
				callback: value => { setDPF(value); },
				min: 1,
				prompt: 'Set Draws/Frame',
			},
			'dps': {
				type: 'UINumberStep',
				key: "'",
				value: dps,
				callback: value => { setDPS(value); },
				prompt: 'Set Draw/Second',
			},
			'onionSkinIsVisible': {
				type: 'UIToggleCheck',
				value: onionSkinIsVisible,
				label: 'Onion Skin',
				key: 'n',
				callback: value => { onionSkinIsVisible = value; }
			},
			'onionSkinNum': {
				type: 'UINumberStep',
				value: onionSkinNum,
				label: 'Frames',
				key: 'l',
				callback: value => { onionSkinNum = value; }
			},
			'viewStats': {
				type: 'UIToggleCheck',
				value: showStats,
				callback: value => { toggleStats(value); }
			},
		});
	}

	return { connect, reset, start, toggleStats, setFrame, checkEnd };
}