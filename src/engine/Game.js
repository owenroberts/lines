import { assert, mobilecheck, testPerformance } from '../../../cool/cool.js';
import { Renderer, Loader } from '../Lines.js';
import { AudioPlayer, Scene, Manager, GameAnim, Input, BBox } from '../Engine.js';
import Stats from 'stats.js';

/**
 * game manager class
 * includes renderer, window, view, loader, scenes, sfx, input, debug, anims list, data, bounds, sizeCanvas
 * calls onSetup, 
 * gm. to overwrite default for onUpdate, onDraw, onKeyDown, onKeyUp 
 * gm.load({ animations: {}, data: {} })
 */
export class Game {

	/**
	 * creates game manager (gm)
	 * @param  {object} params
	 */
	constructor(params) {
		
		this.isDev = import.meta.env.DEV;
		this.debug = (params.debug ?? false) && this.isDev;

		this.renderer = new Renderer({ dps: 60, clearBg: false, ...params }); // update 60
		this.drawCount = 0;
		this.drawInterval = params.drawInterval ?? Math.round(60 / (params.dps || 30));
		this.drawTime = 1000 / (params.dps || 30);

		this.window = new BBox(0, 0, params.width, params.height);
		this.bounds = params.bounds ? 
			new BBox(params.bounds.x, params.bounds.y, params.bounds.width, params.bounds.height) :
			new BBox(0, 0, params.width, params.height);
		
		this.isSuspendOnTimeOver = params.useSuspend ?? false; // whether to update lines
		this.isSuspended = false;
		this.isEditorSuspended = false;
		
		this.loader = new Loader({
			relativeLoadPath: params.relativeLoadPath,
			saveAnimationData: params.saveAnimationData || params.saveJsons || false,
		});

		this.anims = {};
		this.scenes = new Manager(params.scenes, Scene);
		if (params.scenes) {
			params.scenes.forEach(s => this.scenes.add(s, new Scene()));
		}
		this.sfx = new AudioPlayer();
		this.input = new Input({ keyMap: params.keyMap });

		const isMobile = mobilecheck();
		if (isMobile) {
			document.body.classList.add('mobile');
		}

		this.useKeyboardEvents = (params.useKeyboardEvents ?? false) && !isMobile;
		this.useMouseEvents = (params.useMouseEvents ?? false) && !isMobile;
		this.useTouchEvents = (params.useTouchEvents ?? false) && isMobile;

		// view is for zooming in and out, could stay in game, could be part of renderer or its own module ...

		this.zoom = params.zoom ?? 1;
		this.view = new BBox(0, 0, params.width, params.height);

		let ediZoom = params.isEditor ? this.renderer.dpr : 1;

		this.view.setSize(Math.round(this.window.width / this.zoom * ediZoom), Math.round(this.window.height / this.zoom * ediZoom));

		let perfTestIsLow = params.testPerformance ? testLowPerformance() : false;
		let userLowQuality = false;
		if (perfTestIsLow || params.lowPerformance) {
			userLowQuality = params.ignoreAlerts ?
				true :
				confirm('Low performance detected, click Okay to use low graphics quality, cancel to continue with high graphics quality.');
		}
			
		if (userLowQuality) {
			if (this.zoom) {
				this.window.setSize(Math.round(this.window.width / this.zoom), Math.round(this.window.height / this.zoom));
				this.renderer.setWidth(this.window.width);
				this.renderer.setHeight(this.window.height);
				this.renderer.setScale(1);
				
				if (params.smallCanvas) {
					this.renderer.canvas.style.width = this.window.width + 'px';
					this.renderer.canvas.style.height = this.window.height + 'px';
				} else {
					if (params.useSVGFilterOnLow && !navigator.userAgent.includes('Firefox')) {
						params.svgFilter = true;
					}
				}
			}
		} else {
			if (params.zoom) {
				this.renderer.setScale(ediZoom * params.zoom);
			}
		}

		if (params.useStats && this.debug) {
			this.stats = new Stats();
			// this.stats.showPanel(2);
			document.body.appendChild(this.stats.dom);
			this.stats.dom.style.left = 'auto';
			this.stats.dom.style.right = '0px';

			this.drawStats = new Stats();
			document.body.appendChild(this.drawStats.dom);
			this.drawStats.dom.style.left = 'auto';
			this.drawStats.dom.style.right = '0px';
			this.drawStats.dom.style.top = '48px';
		}

		// preloading before anything can be displayed, just HTML
		this.loadingUpdate = false;
		const loadingTitle = document.getElementById(params.loadingTitle ?? "title");
		this.loadingSplash = document.getElementById(params.loadingSplash ?? "splash");
		if (loadingTitle && this.loadingSplash) {
			if (!loadingTitle || !this.loadingSplash) {
				console.warn("Loading splash or message not found.");
			} else {
				this.loadingUpdate = true;
				this.loadingAnimation = function() {
					let t = '~' + title.textContent + '~';
					loadingTitle.textContent = t;
				};
				this.loadingInterval = setInterval(this.loadingAnimation, 1000 / 12);
			}
		}
	}

	setView(width, height) {
		this.renderer.setWidth(width);
		this.renderer.setHeight(height);
		this.window.setSize(width, height);
		this.view.setSize(width / this.zoom, height / this.zoom);
		this.renderer.reset();
	}

	load(files, loadDataOnly, callback) {
		this.data = {};
		this.loader.load(files, loadDataOnly, assets => {
			for (const type in assets) {
				if (type === 'animations') {
					for (const file in assets.animations) {
						this.anims[file] = {};
						for (const key in assets.animations[file]) {
							this.anims[file][key] = new GameAnim(this);
							this.anims[file][key].src = file + '.' + key;
							this.anims[file][key].loadData(assets.animations[file][key].json);
						}
					}
				} else {
					this.data[type] = assets[type];
				}
			}
			this.setup();
			if (this.loadingUpdate) {
				clearInterval(this.loadingInterval);
				this.loadingSplash.remove();
			}
		});
	}

	// placeholder for vite loads
	loaded(files, callback) {
		this.data = {};
		for (const type in files) {
			
		}
	}

	setup() {

		if (this.onSetup) this.onSetup(); // should be this method?
		if (!this.onUpdate) this.noUpdate = true;

		// should just be onDraw or something..
		// this.renderer.addCallback(delta => { this.update(delta) });
		this.renderer.onDraw = timeElapsed => {
			this.update(timeElapsed);
		};
		this.renderer.start();

		if (this.useKeyboardEvents) {
			this.input.setupKeyboardEvents({
				onKeyDown: this.onKeyDown.bind(this), // dont love bind but whatever
				onKeyUp: this.onKeyUp.bind(this),
			});
		}
		if (this.useMouseEvents) this.startMouseEvents();
		if (this.useTouchEvents) this.startTouchEvents();
		if (this.sizeCanvas) window.addEventListener('resize', this.sizeCanvas, false);
	}

	draw(timeElapsed) {
		if (this.stats) this.drawStats.begin();
		// if (clearBg) ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.renderer.ctx.clearRect(0, 0, this.window.width, this.window.height);
		this.onDraw(timeElapsed); // need time ??
		if (this.stats) this.drawStats.end();
	}

	update(timeElapsed) {
		// console.log('_update', delta);
		if (this.pauseGame) return; // should be isPaused
		if (this.stats) this.stats.begin();
		if (!this.noUpdate) this.onUpdate(timeElapsed); // what?
		// if (delta > this.drawTime + this.drawInterval) this._draw(delta);
		if (this.drawCount === 0) this.draw(timeElapsed); // need time?
		this.drawCount = (this.drawCount + 1) % this.drawInterval;
		// console.log(this.drawCount);

		// suspend lines update if performance is dragging
		if (this.isSuspendOnTimeOver && !this.isEditorSuspended) {
			if (!this.isSuspended && timeElapsed > this.drawTime * 1.5) {
				this.isSuspended = true;
				// need to update animations to suspend
			} else if (this.isSuspended) {
				this.isSuspended = false;
			}
		}
		if (this.stats) this.stats.end();
	}

	onUpdate(timeElapsed) {
		if (this.scenes.current.update) {
			this.scenes.current.update(timeElapsed);
		}
	}

	onDraw() {
		this.scenes.current.draw(this.view);

		if (this.isDev) {
			for (let i = 0; i < this.scenes.current.sprites.length; i++) {
				const sprite = this.scenes.current.sprites[i];
				if (sprite.debug) {
					// assert(sprite.bbox, `sprite has no bbox to debug, class: ${sprite.constructor.name}`);
					this.drawDebug({ bbox: sprite.bbox });
					if (sprite.collider) {
						this.drawDebug({
							bbox: sprite.collider, 
							color: '#ff00bb',
						});
					}
				}
			}
		}
	}

	onKeyDown(key) {
		if (this.scenes.current.onKeyDown[key]) {
			this.input.setKey(key, false);
			this.scenes.current.onKeyDown[key]();
		}
	}

	onKeyUp(key) {
		if (this.scenes.current.onKeyUp[key]) {
			this.input.setKey(key, false);
			this.scenes.current.onKeyUp[key]();
		}
	}

	drawDebug({ bbox, x=0, y=0, color="#00ffbb", label }={}) {
		if (!bbox) return;
		assert(bbox.isBBox, `bbox is not bbox`);

		this.renderer.ctx.lineWidth = 1;
		this.renderer.ctx.beginPath();
		this.renderer.ctx.rect(x + bbox.x, y + bbox.y, bbox.w, bbox.h);
		const temp = this.renderer.ctx.strokeStyle;
		this.renderer.ctx.strokeStyle = color;
		this.renderer.ctx.stroke();
		this.renderer.ctx.strokeStyle = temp;
		if (label) {
			this.renderer.ctx.fillText(label, x + bbox.x, y + bbox.y);
		}
		if (this.renderer.lineWidth !== 1) {
			this.renderer.ctx.lineWidth = this.lineWidth;
		}
	}

	startMouseEvents() {
		let dragStarted = false;
		let dragOffset;
		let { canvas } = this.renderer;

		canvas.addEventListener('click', ev => {
			ev.preventDefault();
			if (this.mouseClicked) {
				this.mouseClicked(ev.offsetX / this.zoom, ev.offsetY / this.zoom);
			}
		}, false);

		canvas.addEventListener('mousedown', ev => {
			ev.preventDefault();
			if (this.mouseDown) {
				this.mouseDown(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which, ev.shiftKey);
			}
			if (this.startDrag) {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) dragStarted = true;
			}
		}, false);

		canvas.addEventListener('mouseup', ev => {
			ev.preventDefault();
			if (this.mouseUp) {
				this.mouseUp(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which);
			}
			if (dragStarted) dragStarted = false;
		}, false);

		canvas.addEventListener('mousemove', ev => {
			if (this.mouseMoved) {
				this.mouseMoved(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which);
			}
			if (dragStarted) drag(ev.offsetX / this.zoom, ev.offsetY / this.zoom, dragOffset);
		}, false);
	}

	startTouchEvents() {
		this.canvas.addEventListener('touchstart', ev => {
			ev.preventDefault();
			if (this.touchStart) this.touchStart(ev);
		}, false);

		this.canvas.addEventListener('touchmove', ev => {
			ev.preventDefault();
			if (this.touchMove) this.touchMove(ev);
		}, false);

		this.canvas.addEventListener('touchend', ev => {
			ev.preventDefault();
			if (this.touchEnd) this.touchEnd(ev);
		}, false);
	}
}