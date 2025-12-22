import Stats from 'stats.js';
import { UIPanel } from '../../../oi/src/oi.js';

export class PlaybackPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'playback', ui });

		this.anim = anim;
		this.renderer = renderer;
		this.canvas = renderer.canvas;
		this.ctx = renderer.ctx;

		renderer.onDraw = timeElapsed => {
			this.update(timeElapsed);
		};

		this.isStatsVisible = false;
		
		this.onionSkinFrameCount = 0;
		this.isOnionSkinVisible = false; /* n key */

		this.addButton({
			text: "0",
			key: "0",
			class: "left-end",
			callback: () => {
				this.setFrame(0);
			}
		});

		this.addButton({
			key: 'w', 
			text: '◀',
			class: "middle",
			callback: () => { this.next(-1); }, 
		});

		this.addButton({
			obj: anim,
			ref: "isPlaying",
			callback: value => { this.toggle(value); }, 
			onText: "❚❚", 
			offText: "▶", 
			key: "space",
			class: "middle",
		});

		this.addButton({
			callback: () => { this.next(1); }, 
			class: "middle",
			key: 'e', 
			text: '▶', 
		});

		this.addButton({
			class: "middle",
			key: '+', 
			text: '+',
			callback: () => {
				this.setFrame(this.anim.endFrame);
				this.next(1);
			},
		});
		
		this.addButton({
			class: "right-end",
			key: 'shift-e',
			text: '⎘',
			callback: () => {
				this.ui.panels.data.copy();
				this.next(1);
				this.ui.panels.data.paste();
			}
		});

		this.frameDisplay = this.addRef({
			obj: anim,
			ref: "currentFrame",
			key: "f",
			callback: value => {
				this.setFrame(value);
			}
		});

		// reset renderer ... need to fix this
		this.addButton({
			key: "u",
			"text": "↻", 
			callback: () => { this.update(); }, 
		});

		this.addRef({
			obj: anim,
			ref: "dpf",
			min: 1,
		});

		this.addRef({
			obj: renderer,
			ref: "dps",
			key: "'",
			min: 1,
			callback: value => {
				renderer.setDPS(value);
			},
		});

		this.addRef({
			obj: this,
			ref: "isOnionSkinVisible",
			key: "n",
		});

		this.addRef({
			obj: this,
			ref: "onionSkinFrameCount",
			key: "shift-n",
		});

		this.addRef({
			obj: this,
			ref: "isStatsVisible",
			callback: value => {
				this.toggleStats(value);
			},
		});

		this.addRef({
			obj: anim,
			ref: "isSuspended",
			key: "/",
		});
	}

	setFrame(f) {
		if (+f <= this.anim.endFrame + 1 && +f >= 0) {
			this.anim.frame = +f;
			const layer = this.anim.getDrawLayer();
			layer.startFrame = this.anim.currentFrame;
			layer.endFrame = this.anim.currentFrame;
			this.ui.update();
		} else {
			this.frameDisplay.update(this.anim.currentFrame, true);
		}
	}
	
	toggleStats(value) {
		if (value !== undefined) this.isStatsVisible = value;

		if (!this.stats && this.isStatsVisible) {
			this.stats = new Stats();
			this.stats.dom.style.position = 'fixed';
			this.stats.dom.style.top = '0';
			this.stats.dom.style.right = '96px';
			this.stats.dom.style.left = 'auto';
			this.el.appendChild(this.stats.dom);

			// check if its visible
			const rect = this.stats.dom.getBoundingClientRect();
			if (rect.y < 0) {
				this.stats.dom.style.top = `-${48 + Math.ceil(rect.y)}px`;
			}
		} 
		
		if (this.stats) {
			this.stats.dom.style.display = this.isStatsVisible ? 'block' : 'none';
			this.setStyle('overflow', 'visible');
		} else {
			this.setStyle('overflow', 'hidden');
		}
	}

	/* just set drawing back to 0 but might do other things */
	reset() {
		this.anim.currentFrame = 0;
		this.anim.isPlaying = false;
		this.ui.update();
	}

	toggle() {
		if (!this.anim.isPlaying) {
			this.checkEnd();
			// this.ui.panels.styles.reset();
		} else { // ?
			const layer = this.anim.getDrawLayer();
			layer.startFrame = this.anim.currentFrame;
			layer.endFrame = this.anim.currentFrame;
		}
		this.anim.isPlaying = !this.anim.isPlaying;
		// this.ui.panels.timeline.update();
	}

	// fix for playing animation with nothing in the final frame
	checkEnd() {
		if (this.anim.currentFrame !== this.anim.endFrame) return;
		if (!this.anim.isDrawingInFrame()) {
			this.next(-1);
		}
	}

	/* call before changing a frame */
	next(dir) {

		const nextFrame = this.anim.currentFrame + dir;
		
		// if (this.anim.isPlaying) ui.faces.play.update(); // ?
		this.ui.panels.events.stop();
		
		if (this.anim.getCurrentDrawing().length > 0) {
			// drawing to save - can add frame
			this.ui.panels.styles.reset(nextFrame);
			this.anim.currentFrame = nextFrame;
		} else {
			// put in reset? 
			const layer = this.anim.getDrawLayer();
			if (dir > 0) {
				if (this.anim.currentFrame < this.anim.state.end || 
					(this.anim.stateName == 'default' && this.anim.isDrawingInFrame())) {
					layer.startFrame = nextFrame;
					layer.endFrame = nextFrame;	
					this.anim.frame = nextFrame;
				}
			}

			if (dir < 0 && this.anim.currentFrame > this.anim.state.start) {
				layer.startFrame = nextFrame;
				layer.endFrame = nextFrame;
				this.anim.frame = nextFrame;
			}
		}

		this.frameDisplay.update(this.anim.currentFrame, true);
		this.ui.panels.timeline.select(false, true);
		this.ui.panels.data.saveState();
		this.ui.update();
	}

	update() {

		if (this.stats && this.isStatsVisible) this.stats.begin();
		
		if (this.anim.isPlaying) this.ui.panels.timeline.update();

		if (this.ui.panels.capture.isCapturing()) {
			if (this.ui.panels.capture.isWithBg) {
				this.ctx.fillStyle = this.renderer.bgColor;
				this.ctx.fillRect(0, 0, this.renderer.width, this.renderer.height);
			}
		} else {
			// ignore bg, onion, highlight while capturing
	
			this.ui.panels.bg.draw();

			// onion skin
			if (this.onionSkinFrameCount > 0 && this.isOnionSkinVisible) {
				const temp = this.anim.currentFrame;
				for (let o = 1; o <= this.onionSkinFrameCount; o++){
					const index = temp - o;
					if (index >= 0) {
						this.anim.currentFrame = index;
						this.anim.overrideProperty(
							'color', 
							`rgba(105,150,255,${ 1.5 - (o / this.onionSkinFrameCount) })`
						);
						this.anim.draw();
					}
				}
				this.anim.cancelOverride();
				this.anim.currentFrame = temp;
			}

			// highlight
			if (this.anim.layers.some(l => l.isHighlighted)) {
				this.anim.overrideProperty('color', '#94dfe3');
				this.anim.overrideProperty('lineWidth', 5);
				for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
					const layer = this.anim.layers[i];
					if (!layer.isInFrame(this.anim.currentFrame) || !layer.isHighlighted) {
						layer.dontDraw = true;
					}
				}
				this.anim.draw(0, 0, true);
				this.anim.cancelOverride();
				this.anim.layers.filter(l => l.dontDraw).forEach(l => {
					l.dontDraw = false;
				});
			}

			this.ui.panels.eraser.draw();
		}

		this.anim.update();
		this.anim.draw();

		if (this.isStatsVisible) this.stats.end();
	}
}