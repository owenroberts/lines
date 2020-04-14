class Game {
	constructor(params) {
		this.canvas = document.getElementById(params.canvas || "lines");

		this.width = params.width;
		this.height = params.height;
		this.lps = params.lps;
		this.mixedColors = params.mixedColors || false; /* param? */
		this.debug = params.debug || false;
		this.lineInterval = 1000 / params.lps;

		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps
		this.drawTime = performance.now();

		this.clearBg = true;
		this.bounds = { top: 0, bottom: 0, left: 0, right: 0 };

		this.scenes = new SceneManager(params.scenes, Scene);

		this.data = {};
		this.anims = {};

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.dpr = params.checkRetina ? window.devicePixelRatio || 1 : 1;

			this.canvas.width = this.width * this.dpr;
			this.canvas.height = this.height * this.dpr;
			this.ctx.scale(this.dpr, this.dpr);
			this.canvas.style.zoom = 1 / this.dpr;

			if (params.lineColor) this.ctx.strokeStyle = params.lineColor;
			if (params.scale) this.ctx.scale(params.scale, params.scale);

			if (params.stats) this.stats = new Stats(this.ctx, ['FPS', 'draw']);

			this.ctx.miterLimit = 1; // do this last

		}
	}

	load(files, callback) {
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
					this.data[f] = {};
					this.anims[f] = {};
					this.assetsLoaded[f] = {};
					if (typeof data == 'object') {
						this.data[f].entries = data;
						for (const key in data) {
							this.assetsLoaded[f][key] = false;
							this.loadJSON(f, key, data[key].src);
						}
					} else {
						const csv = CSVToArray(data, ',').splice(1);
						this.data[f].entries = csv;
						for (let i = 0; i < csv.length; i++) {
							const itemName = csv[i][0];
							this.assetsLoaded[f][itemName] = false;
							this.loadJSON(f, itemName, `drawings/${f}/${itemName}.json`);
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
				this.anims[file][key] = new Anim();
				this.anims[file][key].loadData(json, () => {
					this.assetsLoaded[file][key] = true;
				});
			});
	}
	
	start() {
		/* 
			draw and update are separates functions 
			because lines draw at relatively slow rate (10fps) 
		*/
		if (typeof start === "function") start(); // should be this method?
		
		if (typeof update === "function") requestAnimFrame(() => { this.update() });
		if (typeof draw === "function") requestAnimFrame(() => { this.draw() });

		// better way to do events? 
		if (typeof Events != "undefined") Events.init(this.canvas);
	}

	draw() {
		const time = performance.now();
		if (time >= this.drawTime + this.lineInterval) {
			if (this.clearBg) this.ctx.clearRect(0, 0, this.width * this.dpr, this.height * this.dpr);

			// add this scenes ?

			draw(); // draw defined in each this js file, or not ... 
			if (this.stats) {
				this.stats.draw();
				this.stats.update('draw', time, this.drawTime)
			}
			this.drawTime = time;
		}
		requestAnimFrame(() => { this.draw(); });
	}

	update() {
		const time = performance.now();
		if (time > this.updateTime + this.updateInterval) {
			update(); // update defined in each game js file
			if (this.stats) this.stats.update('FPS', time, this.updateTime);
			this.updateTime = time;
		}
		requestAnimFrame(() => { this.update(); });  // this context
	}

	addLettering(animation) {
		const letterIndexString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:?-+'&$;\"!";
		for (let i = 0; i < letterIndexString.length; i++) {
			animation.createNewState(letterIndexString[i], i, i);
		}
	}

	setBounds(dir, value) {
		this.bounds[dir] = value;
	}
}