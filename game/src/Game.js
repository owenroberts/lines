/*
	this is really more like the game loader, renderer, doesn't handle game logic
	loads files
	renders and updates
	manage canvas
	manages scenes
	start function called when load ends ... calls start, update, draw
	params.events - mouse, keyboard, mouse+keyboard

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
*/

const { Renderer, Loader } = window.Lines;

class Game {
	constructor(params) {
		window.GAME = this; // for references in sub classes
		this.renderer = new Renderer({ dps: 60, clearBg: false, ...params }); // update 60
		this.drawCount = 0;
		this.drawInterval = Math.round(60 / (params.dps || 30));
		this.drawTime = 1000 / (params.dps || 30);

		const performanceThreshold = 0.1; // test this
		let performanceAverage = 0.01; // high performance
		
		if (params.testPerformance) {
			const perf = [];
			console.groupCollapsed('perf test')
			for (let i = 0; i < 5; i++) {
				perf.push(Cool.testPerformance());
			}
			performanceAverage = perf.reduce((a, b) => (a + b)) / perf.length;
			console.log('perf avg', performanceAverage); 
			console.groupEnd('perf test');
		}

		this.width = params.width;
		this.height = params.height;
		this.halfWidth = Math.round(params.width / 2);
		this.halfHeight = Math.round(params.height / 2);
		
		this.debug = params.debug || false;
		this.suspendOnTimeOver = params.suspend || false; // whether to update lines
		this.suspend = false;
		this.editorSuspend = false;
		
		this.loader = new Loader({
			relativeLoadPath: params.relativeLoadPath
		});

		this.data = {};
		this.data = { jsons: {} };
		this.saveJsons = params.saveJsons || false;
		this.anims = {};
		
		this.bounds = params.bounds || { top: 0, bottom: 0, left: 0, right: 0 };
		this.scenes = new SceneManager(params.scenes, Scene);

		this.useMouseEvents = params.events ? params.events.includes('mouse') : true;
		this.useKeyboardEvents = params.events ? params.events.includes('keyboard') : true;
		this.useTouchEvents = params.events ? params.events.includes('touch') : false;

		// view is for zooming in and out, could stay in game, could be part of renderer or its own module ...

		this.view = {
			width: this.width,
			height: this.height,
		};

		this.zoom = params.zoom || 1;
		let ediZoom = params.isEditor ? this.renderer.getProps().dpr : 1;
		this.view.width = Math.round(this.width / this.zoom * ediZoom);
		this.view.height = Math.round(this.height / this.zoom * ediZoom);
		this.view.halfWidth = this.view.width / 2;
		this.view.halfHeight = this.view.height / 2;

		let userLowQuality = false;
		if (performanceAverage > performanceThreshold || params.lowPerformance) {
			userLowQuality = params.ignoreAlerts ?
				true :
				confirm('Low performance detected, click Okay to use low graphics quality, cancel to continue with high graphics quality.');
		}
			
		if (userLowQuality) {
			if (this.zoom) {
				this.width = Math.round(this.width / this.zoom);
				this.height = Math.round(this.height / this.zoom);
				this.halfWidth = Math.round(this.width / 2);
				this.halfHeight = Math.round(this.height / 2);
				this.renderer.setWidth(this.width);
				this.renderer.setHeight(this.height);
				this.renderer.setScale(1);
				
				if (params.smallCanvas) {
					this.renderer.canvas.style.width = this.width + 'px';
					this.renderer.canvas.style.height = this.height + 'px';
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
			document.body.appendChild(this.stats.dom);
			this.stats.dom.style.left = 'auto';
			this.stats.dom.style.right = '0px';

			this.drawStats = new Stats();
			document.body.appendChild(this.drawStats.dom);
			this.drawStats.dom.style.left = 'auto';
			this.drawStats.dom.style.right = '0px';
			this.drawStats.dom.style.top = '48px';

		}
		
	}

	setView(width, height) {

		// copy paste for now, redo later
		this.renderer.setWidth(width);
		this.renderer.setHeight(height);
		this.width = width;
		this.height = height;

		this.halfWidth = Math.round(width / 2);
		this.halfHeight = Math.round(height / 2);

		this.view.width = Math.round(this.width / this.zoom);
		this.view.height = Math.round(this.height / this.zoom);
		this.view.halfWidth = this.view.width / 2;
		this.view.halfHeight = this.view.height / 2;

		this.renderer.reset();
	}

	load(files, loadEntriesOnly, callback) {
		// this.loader.load(files, loadEntriesOnly, callback);
		if (this.debug) console.log('loading data');
		if (this.debug) console.time('load data');
		this.assetsLoaded = {};
		const numFiles = Object.keys(files).length;
		for (const f in files) {
			const file = files[f];
			fetch(file)
				.then(response => {
					if (response.ok) return response.url.includes('csv') ? response.text() : response.json();
					throw new Error('Network response was not ok.');
				})
				.then(data => {
					
					// are we loading anything that's not an animation? just attach data to anims?
					this.data[f] = {};
					this.anims[f] = {};
					this.assetsLoaded[f] = {};

					if (typeof data == 'object') {
						// why can't these just be arrays?
						this.data[f].entries = data;
						for (const key in data) {
							this.assetsLoaded[f][key] = loadEntriesOnly ? true : false; // for editor loading
							if (!loadEntriesOnly) this.loadJSON(f, key, data[key].src);
							this.data[f].entries[key].src = data[key].src;
						}
					} else {
						// csv item names have to match drawing names
						const csv = CSVToArray(data, ',').splice(0);

						// convert to json? 
						this.data[f].entries = [];
						const keys = csv[0];
						for (let i = 1; i < csv.length; i++) {
							const itemData = {};
							for (let j = 0; j < keys.length; j++) {
								itemData[keys[j]] = csv[i][j];
							}
							this.data[f].entries.push(itemData);
							// const itemName = csv[i][0];
							this.assetsLoaded[f][itemData.label] = false;
							// drawings included in path for json files ...
							this.loadJSON(f, itemData.label, `drawings/${f}/${itemData.label}.json`);
						}
					}
				})
				.catch(error => {
					console.error(error);
					this.assetsLoaded[f] = true;
				});
		}

		const loader = setInterval(() => {
			let loaded = Object.keys(this.assetsLoaded).length == numFiles;
			for (const f in this.assetsLoaded) {
				for (const k in this.assetsLoaded[f]) {
					if (!this.assetsLoaded[f][k]) loaded = false;
				}
			}
			if (loaded) {
				if (this.debug) console.timeEnd('load data');
				clearInterval(loader);
				// when will this ever not be game start?
				// if (callback) callback();
				this._start();
			}
		}, 1000 / 60);
	}

	loadAssets(type, files) {
		if (this.debug) console.log('loading assets');
		if (this.debug) console.time('load assets');

		const numFiles = Object.keys(files).length;
		this.assetsLoaded = {};
		this.data[type] = {};
		this.anims[type] = {};
		this.assetsLoaded[type] = {};

		this.data[type].entries = files;

		for (const f in files) {
			this.assetsLoaded[type][f] = false;
			this.loadJSON(type, f, files[f]);
		}

		const loader = setInterval(() => {
			let loaded = Object.keys(this.assetsLoaded[type]).length === numFiles;
			for (const f in this.assetsLoaded[type]) {
				if (!this.assetsLoaded[type][f]) loaded = false;
			}
			if (loaded) {
				if (this.debug) console.timeEnd('load assets');
				clearInterval(loader);
				this._start();
			}
		}, 1000 / 60);
	}

	loadJSON(file, key, src) {
		if (this.relativeLoadPath) src = '.' + src;
		fetch(src)
			.then(response => { return response.json(); })
			.then(json => {
				if (this.saveJsons) this.data.jsons[src] = json;
				this.anims[file][key] = new GameAnim();
				this.anims[file][key].src = src; // debug 
				this.anims[file][key].loadData(json, () => {
					this.assetsLoaded[file][key] = true;
				});
			});
	}

	_start() {
		this.drawTime = performance.now();

		this.renderer.start();
		if (this.start) this.start(); // should be this method?
		if (!this.update) this.noUpdate = true;

		this.renderer.addCallback(delta => { this._update(delta) });
		
		if (this.stats) {
			this.renderer.addCallback(() => {
				this.stats.begin();
			}, 'pre');
			this.renderer.addCallback(() => {
				this.stats.end();
			}, 'pre');
		}

		if (this.useMouseEvents) this.startMouseEvents();
		if (this.useKeyboardEvents) this.startKeyboardEvents();
		if (this.useTouchEvents) this.startTouchEvents();
		if (this.sizeCanvas) window.addEventListener('resize', this.sizeCanvas, false);
	}

	_draw() {
		if (this.stats) this.drawStats.begin();
		this.renderer.ctx.clearRect(0, 0, this.width, this.height);
		this.draw(); // need time ??
		if (this.stats) this.drawStats.end();
	}

	_update(delta) {
		if (this.pauseGame) return;
		if (!this.noUpdate) this.update(delta);
		if (delta > this.drawTime + this.drawInterval) this._draw(time);
		if (this.drawCount === 0) this._draw(); // need time?
		this.drawCount = (this.drawCount + 1) % this.drawInterval;

		// suspend lines update if performance is dragging
		if (this.suspendOnTimeOver && !this.editorSuspend) {
			if (!this.suspend && delta > this.drawTime * 1.5) {
				this.suspend = true;
			} else if (this.suspend) {
				this.suspend = false;
			}
		}
	}

	setBounds(dir, value) {
		this.bounds[dir] = Math.round(value);
	}

	updateBounds(position) {
		if (position.y < this.bounds.top) 
			this.bounds.top = Math.round(position.y);
		if (position.y > this.bounds.bottom) 
			this.bounds.bottom = Math.round(position.y + this.height);
		if (position.x > this.bounds.right) 
			this.bounds.right = Math.round(position.x + this.width / 2);
		if (position.x < this.bounds.left) 
			this.bounds.left = Math.round(position.x - this.width / 2);
	}

	startMouseEvents() {
		let dragStarted = false;
		let dragOffset;
		let { canvas } = this.renderer;

		canvas.addEventListener('click', ev => {
			ev.preventDefault();
			if (this.mouseClicked) this.mouseClicked(ev.offsetX / this.zoom, ev.offsetY / this.zoom);
		}, false);

		canvas.addEventListener('mousedown', ev => {
			ev.preventDefault();
			if (this.mouseDown) this.mouseDown(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which, ev.shiftKey);
			if (this.startDrag) {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) dragStarted = true;
			}
		}, false);

		canvas.addEventListener('mouseup', ev => {
			ev.preventDefault();
			if (this.mouseUp) this.mouseUp(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which);
			if (dragStarted) dragStarted = false;
		}, false);

		canvas.addEventListener('mousemove', ev => {
			if (this.mouseMoved) this.mouseMoved(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which);
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

	startKeyboardEvents() {
		document.addEventListener('keydown', ev => {
			if (this.keyDown && ev.target.tagName !== "INPUT") this.keyDown(Cool.keys[ev.which]);
		});

		document.addEventListener('keyup', ev => {
			if (this.keyUp && ev.target.tagName !== "INPUT") this.keyUp(Cool.keys[ev.which]);
		});
	}
}

window.LinesEngine = {};
window.LinesEngine.Game = Game; // need for iife and prob need later, still weird