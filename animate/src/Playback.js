/*
	play back stfuff
*/

function Playback(lns, params) {

	const { canvas, ctx } = lns.renderer;
	
	let onionSkinNum = 0; /* l key */
	let onionSkinIsVisible = false; /* n key */

	let stats, playPanel, frameDisplay;
	let showStats = params.showStats || false;

	lns.renderer.addCallback(update);
	lns.renderer.addCallback(preTime, 'pre');
	lns.renderer.addCallback(postRender, 'post');

	function toggleStats(value) {
		if (value !== undefined) showStats = value;

		if (!stats && showStats) {
			stats = new Stats();
			stats.dom.style.position = 'absolute';
			stats.dom.style.top = '-48px';
			stats.dom.style.right = '0';
			stats.dom.style.left = 'auto';
			playPanel.el.appendChild(stats.dom);

			// check if its visible
			const rect = stats.dom.getBoundingClientRect();
			if (rect.y < 0) {
				stats.dom.style.top = `-${48 + Math.ceil(rect.y)}px`;
			}
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
		lns.ui.update();
	}

	function toggle() {
		if (!lns.anim.isPlaying) {
			checkEnd();
			lns.draw.reset();
		} else { // ?
			const layer = lns.anim.getDrawLayer();
			layer.startFrame = lns.anim.currentFrame;
			layer.endFrame = lns.anim.currentFrame;
		}
		lns.anim.isPlaying = !lns.anim.isPlaying;
		lns.timeline.update();
	}

	/* ' - dps is property of render engine, not individual animations */
	function setDPS(value) {
		lns.renderer.setDPS(value);
		lns.anim.drawsPerFrame = Math.max(1, Math.round(lns.renderer.getProps().dps / lns.anim.fps));
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

			const layer = lns.anim.getDrawLayer();
			layer.startFrame = lns.anim.currentFrame;
			layer.endFrame = lns.anim.currentFrame;
			
			lns.ui.update();
		} else {
			frameDisplay.update(lns.anim.currentFrame, true);
		}
	}

	// fix for playing animation with nothing in the final frame
	function checkEnd() {
		if (lns.anim.currentFrame === lns.anim.endFrame && !lns.anim.isDrawingInFrame()) {
			next(-1);
		}
	}

	/* call before changing a frame */
	function next(dir) {

		const next = lns.anim.currentFrame + dir;
		
		if (lns.anim.isPlaying) lns.ui.faces.play.update(); // ?
		lns.events.stop();
		
		if (lns.anim.getCurrentDrawing().length > 0) {
			// drawing to save - can add frame
			lns.draw.reset(next);
			lns.anim.frame = next;
		} else {
			// put in reset? 
			const layer = lns.anim.getDrawLayer();
			if (dir > 0) {
				if (lns.anim.currentFrame < lns.anim.state.end || 
					(lns.anim.stateName == 'default' && lns.anim.isDrawingInFrame())) {
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

	function preTime() {
		if (showStats) stats.begin();
	}

	function postRender() {
		if (showStats) stats.end();
	}

	function update() {
		
		if (lns.anim.isPlaying) lns.timeline.update();
		const { width, height, bgColor } = lns.renderer.getProps();

		/* 
			in capture set animation onDraw 
			move this logic to capture
		*/

		if (lns.capture.isActive()) {
			if (lns.capture.withBackground()) {
				ctx.fillStyle = bgColor;
				ctx.fillRect(0, 0, width, height);
			}
		} else {
			// ignore bg, onion, highlight while capturing
	
			lns.bg.display(width, height); // part of canvas module?

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
						lns.anim.draw();
					}
				}
				lns.anim.cancelOverride();
				lns.anim.currentFrame = temp;
			}

			// highlight
			if (lns.anim.layers.some(l => l.isHighlighted)) {
				lns.anim.overrideProperty('color', '#94dfe3');
				lns.anim.overrideProperty('lineWidth', 5);
				for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
					const layer = lns.anim.layers[i];
					if (!layer.isInFrame(lns.anim.currentFrame) || !layer.isHighlighted) {
						layer.dontDraw = true;
					}
				}
				lns.anim.draw(0, 0, true);
				lns.anim.cancelOverride();
				lns.anim.layers.filter(l => l.dontDraw).forEach(l => {
					l.dontDraw = false;
				});
			}

			lns.eraser.display();
		}

		if (lns.sequencer.isActive()) {
			const f = lns.sequencer.getFrame();
			lns.anim.frame = f;
			frameDisplay.value = f;
			if (lns.sequencer.isPlaying()) lns.timeline.update();
		} else {
			lns.anim.update();
		}

		lns.anim.draw();
	}

	function connect() {
		
		playPanel = lns.ui.getPanel('play', { label: 'Play Back'});

		lns.ui.addCallbacks([
			{ callback: setFrame, key: '0', text: '0', args: [0] },
			{ callback: next, key: 'w', text: '◀', args: [-1] },
			// play btn
			{ callback: toggle, type: 'UIToggle', value: false, text: 'Play', "onText": "❚❚", "offText": "▶", key: 'space' },
			{ callback: next, key: 'e', text: '▶', args: [1] },
			{ callback: plus, key: '+', text: '+'}
		], 'play');
	
		frameDisplay = lns.ui.addUI({ 
			type: "UINumberStep",
			callback: setFrame, 
			face: 'frameDisplay',
			key: 'f',
			value: 0,
			prompt: 'Set Frame',
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
				value: lns.renderer.getProps().dps,
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
				key: 'shift-n',
				prompt: 'Onion Skin Frames',
				callback: value => { onionSkinNum = value; }
			},
			'viewStats': {
				type: 'UIToggleCheck',
				value: params.showStats,
				callback: value => { toggleStats(value); }
			},
		});
	}

	return { 
		connect, reset, update, toggleStats, setFrame, checkEnd, next,
		getDPS() { return lns.renderer.getProps().dps; },
	};
}