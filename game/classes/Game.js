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

		this.width = params.width;
		this.height = params.height;
		
		this.multiColor = params.multiColor || false; /* param? */
		this.debug = params.debug || false;
		this.suspendOnTimeOver = params.suspend || false; // whether to update lines
		this.suspend = false;
		this.editorSuspend = false;
		this.lineWidth = params.lineWidth || 1;
		this.checkRetina = params.checkRetina !== undefined ? params.checkRetina : true;

		this.dps = params.dps || 30; // draw per second
		this.drawTime = performance.now();
		this.drawInterval = 1000 / params.dps;
		window.drawCount = 0; // global referenced in drawings -- prevents double updates for textures and 
		
		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps

		this.clearBg = true;
		this.bounds = { top: 0, bottom: 0, left: 0, right: 0 };

		this.scenes = new SceneManager(params.scenes, Scene);

		this.data = {};
		this.anims = {};

		this.useMouseEvents = params.events ? params.events.includes('mouse') : true;
		this.useKeyboardEvents = params.events ? params.events.includes('keyboard') : true;

		this.view = {
			width: this.width,
			height: this.height,
		};

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.dpr = this.checkRetina ? window.devicePixelRatio || 1 : 1;

			this.canvas.width = this.width * this.dpr;
			this.canvas.height = this.height * this.dpr;
			this.ctx.scale(this.dpr, this.dpr);
			this.canvas.style.zoom = 1 / this.dpr;

			const zoom = params.zoom || 1;
			const ediZoom = params.isEditor ? this.dpr : 1;

			this.view.width = Math.round(this.width / zoom * ediZoom);
			this.view.height = Math.round(this.height / zoom * ediZoom);

			if (params.zoom) {
				this.ctx.scale(params.zoom * ediZoom, params.zoom * ediZoom);
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
		}
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
				this.start();
			}
		}, 1000 / 60);
	}

	loadJSON(file, key, src) {
		fetch(src)
			.then(response => { return response.json(); })
			.then(json => {
				this.anims[file][key] = new GameAnim();
				this.anims[file][key].src = src; // debug 
				this.anims[file][key].loadData(json, () => {
					this.assetsLoaded[file][key] = true;
				});
			});
	}

	start() {
		this.drawTime = performance.now();
		this.updateTime = performance.now();
		
		if (typeof start === "function") start(); // should be this method?
		if (typeof update !== "function") this.noUpdate = true;
		requestAnimFrame(() => { this.update() });

		if (this.useMouseEvents) this.startMouseEvents();
		if (this.useKeyboardEvents) this.startKeyboardEvents();
		if (typeof sizeCanvas === "function") window.addEventListener('resize', sizeCanvas, false);
	}

	draw(time) {
		if (this.stats) this.drawStats.begin();
		if (this.clearBg) this.ctx.clearRect(0, 0, this.view.width, this.view.height);
		// add draw scenes ? 
		draw(time - this.drawTime); // draw defined in each this js file, or not ... 
		drawCount++;

		this.drawTime = time - ((time - this.drawTime) % this.drawInterval);
		if (this.stats) this.drawStats.end();
	}

	update() {
		if (this.stats) this.stats.begin();
		requestAnimFrame(() => { this.update(); });  // this context

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


			if (!this.noUpdate) update(time - this.updateTime); // update defined in each game js file
			this.updateTime = time - ((time - this.updateTime) % this.updateInterval); // adjust for fps interval being off
			// this.updateTime = time;
			// if (this.stats) this.stats.update('FPS', time);
		}
		if (time > this.drawTime + this.drawInterval) this.draw(time);
		if (this.stats) this.stats.end();
	}

	setBounds(dir, value) {
		this.bounds[dir] = value;
	}

	updateBounds(position) {
		if (position.y < this.bounds.top) 
			this.bounds.top = position.y;
		if (position.y > this.bounds.bottom) 
			this.bounds.bottom = position.y + this.height;
		if (position.x > this.bounds.right) 
			this.bounds.right = position.x + this.width/2;
		if (position.x < this.bounds.left) 
			this.bounds.left = position.x - this.width/2;
	}

	setupGrid(dimensions) {
		this.grid = new SpatialGrid(this.bounds, [gme.view.width, gme.view.height]);
		this.scenes.names.forEach(scene => {
			const sprites = this.scenes[scene].displaySprites.sprites;
			for (let i = 0; i < sprites.length; i++) {
				const s = sprites[i];
				if (s.constructor.name === 'Entity') {
					const cells = this.grid.getCells(s.x, s.y, s.width, s.height);
					s.cells = cells;
				}
			}
		});
		console.log(this.grid);
	}

	startMouseEvents() {
		let dragStarted = false;
		let dragOffset;

		this.canvas.addEventListener('click', function(ev) {
			ev.preventDefault();
			if (typeof mouseClicked === "function") 
				mouseClicked(ev.offsetX, ev.offsetY);
		}, false);

		this.canvas.addEventListener('mousedown', function(ev) {
			ev.preventDefault();
			if (typeof mouseDown === "function") 
				mouseDown(ev.offsetX, ev.offsetY, ev.which, ev.shiftKey);
			if (typeof startDrag === "function") {
				dragOffset = startDrag(ev.offsetX, ev.offsetY);
				if (dragOffset) dragStarted = true;
			}
		}, false);

		this.canvas.addEventListener('mouseup', function(ev) {
			ev.preventDefault();
			if (typeof mouseUp === "function") 
				mouseUp(ev.offsetX, ev.offsetY, ev.which);
			if (dragStarted) dragStarted = false;
		}, false);

		this.canvas.addEventListener('mousemove', function(ev) {
			if (typeof mouseMoved === "function") 
				mouseMoved(ev.offsetX, ev.offsetY, ev.which);
			if (dragStarted) 
				drag(ev.offsetX, ev.offsetY, dragOffset);
		}, false);
	}

	startKeyboardEvents() {
		document.addEventListener('keydown', function(ev) {
			if (typeof keyDown === "function" && ev.target.tagName != "INPUT") 
				keyDown(Cool.keys[ev.which]);
		});

		document.addEventListener('keyup', function(ev) {
			if (typeof keyUp === "function" && ev.target.tagName != "INPUT") 
				keyUp(Cool.keys[ev.which]);
		});
	}
}