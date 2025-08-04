/*
	user defined functions:
	start - create anything using loaded animations
	draw - draw sprites, anything not in scenes
	update - update user input only

	sizeCanvas - handle canvas resize

	keyDown(key)
	keyUp(key)

	mouseMoved(x, y, which)
	mouseDown(x, y, which)
	mouseUp(x, y, which)

	load -- load animations and data
	gme.load({ animations: {}, data: {} })
	animations load files in each file, data returns data from whatever file
	later add sound
*/

import { mobilecheck, testPerformance } from '../../../cool/cool.js';
import { Renderer, Loader } from '../Lines.js';
import { AudioPlayer, Scene, Manager, GameAnim, Input, BBox } from '../Engine.js';
import Stats from 'stats.js';

export class Game {
	constructor(params) {
		window.GAME = this; // for references in sub classes

		this.renderer = new Renderer({ dps: 60, clearBg: false, ...params }); // update 60
		this.drawCount = 0;
		this.drawInterval = params.drawInterval ?? Math.round(60 / (params.dps || 30));
		this.drawTime = 1000 / (params.dps || 30);

		this.window = new BBox(0, 0, params.width, params.height);
		this.bounds = params.bounds ? 
			new BBox(params.bounds.x, params.bounds.y, params.bounds.width, params.bounds.height) :
			new BBox(0, 0, params.width, params.height);
		
		this.debug = (params.debug ?? false) && import.meta.env.DEV;
		this.suspendOnTimeOver = params.suspend || false; // whether to update lines
		this.suspend = false;
		this.editorSuspend = false;
		
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

		// this should just be booleans
		this.useKeyboardEvents = params.events?.includes('keyboard') && !isMobile;
		this.useMouseEvents = params.events?.includes('mouse') && !isMobile;
		this.useTouchEvents = params.events?.includes('touch') && isMobile;

		// view is for zooming in and out, could stay in game, could be part of renderer or its own module ...

		this.zoom = params.zoom ?? 1;
		this.view = new BBox(0, 0, params.width, params.height);

		let ediZoom = params.isEditor ? this.renderer.getProps().dpr : 1;

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

		if (params.stats) {
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
							this.anims[file][key] = new GameAnim();
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

		this.renderer.start();
		if (this.onSetup) this.onSetup(); // should be this method?
		if (!this.onUpdate) this.noUpdate = true;

		// should just be onDraw or something..
		this.renderer.addCallback(delta => { this.update(delta) });

		if (this.useKeyboardEvents) {
			this.input.setupKeyboardEvents({
				onKeyDown: this.onKeyDown,
				onKeyUp: this.onKeyUp,
			});
		}
		if (this.useMouseEvents) this.startMouseEvents();
		if (this.useTouchEvents) this.startTouchEvents();
		if (this.sizeCanvas) window.addEventListener('resize', this.sizeCanvas, false);
	}

	draw(delta) {
		if (this.stats) this.drawStats.begin();
		// if (clearBg) ctx.clearRect(0, 0, canvas.width, canvas.height);
		this.renderer.ctx.clearRect(0, 0, this.window.width, this.window.height);
		this.onDraw(delta); // need time ??
		if (this.stats) this.drawStats.end();
	}

	update(delta) {
		// console.log('_update', delta);
		if (this.pauseGame) return; // should be isPaused
		if (this.stats) this.stats.begin();
		if (!this.noUpdate) this.onUpdate(delta); // what?
		// if (delta > this.drawTime + this.drawInterval) this._draw(delta);
		if (this.drawCount === 0) this.draw(delta); // need time?
		this.drawCount = (this.drawCount + 1) % this.drawInterval;
		// console.log(this.drawCount);

		// suspend lines update if performance is dragging
		if (this.suspendOnTimeOver && !this.editorSuspend) {
			if (!this.suspend && delta > this.drawTime * 1.5) {
				this.suspend = true;
			} else if (this.suspend) {
				this.suspend = false;
			}
		}
		if (this.stats) this.stats.end();
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