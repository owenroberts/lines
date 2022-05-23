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

class Game {
	constructor(params) {
		window.GAME = this; // for references in sub classes

		this.canvas = document.getElementById(params.canvas || "lines");

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
		
		this.multiColor = params.multiColor || false; /* param? */
		this.debug = params.debug || false;
		this.suspendOnTimeOver = params.suspend || false; // whether to update lines
		this.suspend = false;
		this.editorSuspend = false;
		this.lineWidth = params.lineWidth || 1;
		this.checkRetina = params.checkRetina !== undefined ? params.checkRetina : true;
		this.zoom = params.zoom;
		this.relativeLoadPath = params.relativeLoadPath;

		this.dps = params.dps || 30; // draw per second
		this.drawTime = performance.now();
		this.drawInterval = 1000 / this.dps;
		window.drawCount = 0; // global referenced in drawings -- prevents double updates for textures and 
		
		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps

		this.clearBg = params.clearBg !== undefined ? params.clearBg : true;
		this.bounds = params.bounds || { top: 0, bottom: 0, left: 0, right: 0 };

		this.scenes = new SceneManager(params.scenes, Scene);

		this.data = { jsons: {} };
		this.saveJsons = params.saveJsons || false;
		this.anims = {};

		this.useMouseEvents = params.events ? params.events.includes('mouse') : true;
		this.useKeyboardEvents = params.events ? params.events.includes('keyboard') : true;
		this.useTouchEvents = params.events ? params.events.includes('touch') : false;

		this.view = {
			width: this.width,
			height: this.height,
		};

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');

			this.dpr = this.checkRetina ? window.devicePixelRatio || 1 : 1;

			const zoom = params.zoom || 1;
			this.zoom = params.zoom;
			const ediZoom = params.isEditor ? this.dpr : 1;

			this.canvas.width = this.width * this.dpr;
			this.canvas.height = this.height * this.dpr;
			this.canvas.style.width = this.width + 'px';
			this.canvas.style.height = this.height + 'px';

			this.view.width = Math.round(this.width / zoom * ediZoom);
			this.view.height = Math.round(this.height / zoom * ediZoom);
			this.view.halfWidth = this.view.width / 2;
			this.view.halfHeight = this.view.height / 2;

			if (performanceAverage > performanceThreshold || params.lowPerformance) {
				if (!this.debug && !params.stats) alert('Low browser performance detected, the graphics will be smaller, refresh page to test again.');
				if (this.zoom) {
					this.width = Math.round(this.width / this.zoom);
					this.height = Math.round(this.height / this.zoom);
					this.halfWidth = Math.round(this.width / 2);
					this.halfHeight = Math.round(this.height / 2);
					this.canvas.width = this.width;
					this.canvas.height = this.height;

					// small canvas
					if (params.smallCanvas) {
						this.canvas.style.width = this.width + 'px';
						this.canvas.style.height = this.height + 'px';
					}
				}
			} else {
				this.ctx.scale(this.dpr, this.dpr);
				if (params.zoom) {
					this.ctx.scale(ediZoom, ediZoom);
					this.ctx.scale(params.zoom, params.zoom);
				}
			}

			if (params.lineColor) this.ctx.strokeStyle = params.lineColor;

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

			this.ctx.lineWidth = this.lineWidth;
			this.ctx.miterLimit = 1; // do this last
			this.ctx.lineCap = 'round';
			this.ctx.lineJoin = 'round';
		}

		if (params.usePixels) {
			Object.assign(Lines.prototype, PixelMixin);
		}

		if (params.antiFactor) {
			Object.assign(Lines.prototype, AntiMixin);
			this.antiFactor = params.antiFactor;
			this.canvas.width = this.width * this.dpr * this.antiFactor;
			this.canvas.height = this.height * this.dpr * this.antiFactor;
			this.canvas.style.width = (this.width * this.dpr) + 'px';  
			this.canvas.style.height = (this.height * this.dpr) + 'px';
			this.ctx.lineWidth = this.lineWidth * this.antiFactor;
		}

		if (params.svgFilter) {
			const svgns = "http://www.w3.org/2000/svg";
			const svg = document.createElementNS(svgns, "svg");
			const defs = document.createElementNS(svgns, "defs");
			const filter = document.createElementNS(svgns, "filter");
			const feComponentTransfer = document.createElementNS(svgns, "feComponentTransfer");
			const feFuncA = document.createElementNS(svgns, "feFuncA");

			svg.setAttribute('style', 'position:absolute;z-index:-1;');
			svg.setAttribute('width', '0');
			svg.setAttribute('height', '0');

			document.body.appendChild(svg);
			svg.appendChild(defs);
			defs.appendChild(filter);

			filter.setAttribute('id', 'remove-alpha');
			filter.setAttribute('x', '0');
			filter.setAttribute('y', '0');
			filter.setAttribute('width', '100%');
			filter.setAttribute('height', '100%');
			filter.appendChild(feComponentTransfer);
			feComponentTransfer.appendChild(feFuncA);

			feFuncA.setAttribute('type', 'discrete');
			feFuncA.setAttribute('tableValues', '0 1');

			this.ctx.filter = 'url(#remove-alpha)';
		}
	}

	setView(width, height) {

		// copy paste for now, redo later
		this.width = width;
		this.height = height;

		this.halfWidth = width / 2;
		this.halfHeight = height / 2;

		this.canvas.width = this.width * this.dpr;
		this.canvas.height = this.height * this.dpr;
		this.ctx.scale(this.dpr, this.dpr);
		this.canvas.style.zoom = 1 / this.dpr;

		this.view.width = Math.round(this.width / this.zoom);
		this.view.height = Math.round(this.height / this.zoom);
		this.view.halfWidth = this.view.width / 2;
		this.view.halfHeight = this.view.height / 2;

		if (this.zoom) {
			this.ctx.scale(this.zoom, this.zoom);
		}

		this.ctx.lineWidth = this.lineWidth;
		this.ctx.miterLimit = 1; // do this last
	}

	load(files, loadEntriesOnly, callback) {
		/* loads one instance of all animations to be used/shared by sprites */
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
		this.updateTime = performance.now();
		
		if (this.start) this.start(); // should be this method?
		if (!this.update) this.noUpdate = true;
		requestAnimFrame(() => { this._update() });

		if (this.useMouseEvents) this.startMouseEvents();
		if (this.useKeyboardEvents) this.startKeyboardEvents();
		if (this.useTouchEvents) this.startTouchEvents();
		if (this.sizeCanvas) window.addEventListener('resize', this.sizeCanvas, false);
	}

	_draw(time) {
		if (this.stats) this.drawStats.begin();
		if (this.clearBg) this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
		// add draw scenes ? 
		this.draw(time - this.drawTime); // draw defined in each this js file, or not ... 
		drawCount++;

		this.drawTime = time - ((time - this.drawTime) % this.drawInterval);
		if (this.stats) this.drawStats.end();
	}

	_update() {
		if (this.pauseGame) return;
		if (this.stats) this.stats.begin();
		requestAnimFrame(() => { this._update(); });  // this context

		const time = performance.now();
		
		if (time > this.updateTime + this.updateInterval) {

			// interesting approach to fixing performance but looks mad choppy
			// would be better to suspend a bit, like only every other or something
			if (this.suspendOnTimeOver && !this.editorSuspend) {
				if (!this.suspend && time - this.updateTime > this.drawInterval * 1.5) {
					this.suspend = true;
				} else if (this.suspend) {
					this.suspend = false;
				}
			}


			if (!this.noUpdate) this.update(time - this.updateTime); // update defined in each game js file
			this.updateTime = time - ((time - this.updateTime) % this.updateInterval); // adjust for fps interval being off
		}
		if (time > this.drawTime + this.drawInterval) this._draw(time);
		if (this.stats) this.stats.end();
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

		this.canvas.addEventListener('click', ev => {
			ev.preventDefault();
			if (this.mouseClicked) this.mouseClicked(ev.offsetX / this.zoom, ev.offsetY / this.zoom);
		}, false);

		this.canvas.addEventListener('mousedown', ev => {
			ev.preventDefault();
			if (this.mouseDown) this.mouseDown(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which, ev.shiftKey);
			if (this.startDrag) {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) dragStarted = true;
			}
		}, false);

		this.canvas.addEventListener('mouseup', ev => {
			ev.preventDefault();
			if (this.mouseUp) this.mouseUp(ev.offsetX / this.zoom, ev.offsetY / this.zoom, ev.which);
			if (dragStarted) dragStarted = false;
		}, false);

		this.canvas.addEventListener('mousemove', ev => {
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