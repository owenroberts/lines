const Game = {
	init: function(params) {
		this.canvas = document.getElementById(params.canvas || "lines");
		
		// window.AudioContext = window.AudioContext || window.webkitAudioContext; // update audio new chrome
		// this.audioCtx = new AudioContext(); // not using this rn
		
		/* some kind of setup for this? */
		this.width = params.width;
		this.height = params.height;
		this.lps = params.lps;
		this.lineInterval = 1000 / params.lps;
		this.currentScene = 0;
		this.lettering = {};

		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps
		this.drawTime = performance.now();
		this.stats = params.stats || false;

		this.mixedColors = params.mixedColors || false; /* param? */
		this.debug = params.debug || false;

		this.clearBg = true;

		this.bounds = { top: 0, bottom: 0, left: 0, right: 0 };

		this.data = {};
		this.scenes = {};
		for (let i = 0; i < params.scenes.length; i++) {
			this.scenes[params.scenes[i]] = new Scene();
		}

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.dpr = params.checkRetina ? window.devicePixelRatio || 1 : 1;

			this.canvas.width = this.width * this.dpr;
			this.canvas.height = this.height * this.dpr;
			this.ctx.scale(this.dpr, this.dpr);
			this.canvas.style.zoom = 1 / this.dpr;

			if (params.lineColor) this.ctx.strokeStyle = params.lineColor;
			if (params.scale) this.ctx.scale(params.scale, params.scale);

			this.ctx.miterLimit = 1;
		}

		this.loaded = {}; /* auto save loaded json sprites */
	},
	load: function(files, callback) {
		Game.assetsLoaded = {};
		const numFiles = Object.keys(files).length;
		for (const f in files) {
			const file = files[f];
			fetch(file)
				.then(response => {
					if (response.ok) {
						return response.url.includes('csv') ? response.text() : response.json();
					}
					throw new Error('Network response was not ok.');
				})
				.then(data => {
					Game.data[f] = {};
					Game.assetsLoaded[f] = {};
					if (typeof data == 'object') {
						Game.data[f].entries = data;
						for (const key in data) {
							Game.assetsLoaded[f][key] = false;
							Game.loadJSON(f, key, data[key].src);
						}
					} else {
						const csv = CSVToArray(data, ',').splice(1);
						Game.data[f].entries = csv;
						for (let i = 0; i < csv.length; i++) {
							const itemName = csv[i][0];
							Game.assetsLoaded[f][itemName] = false;
							Game.loadJSON(f, itemName, `drawings/${f}/${itemName}.json`);
						}
					}
				})
				.catch(error => {
					console.error(error);
					Game.assetsLoaded[f] = true;
				});
		}

		const loader = setInterval(function() {
			let loaded = Object.keys(Game.assetsLoaded).length == numFiles;
			for (const f in Game.assetsLoaded) {
				for (const k in Game.assetsLoaded[f]) {
					if (!Game.assetsLoaded[f][k]) loaded = false;
				}
			}
			if (loaded) {
				clearInterval(loader);
				if (callback) callback();
			}
		}, 1000 / 60);
	},
	loadJSON: function(file, key, src) {
		fetch(src)
			.then(response => { return response.json(); })
			.then(json => {
				Game.data[file][key] = json;
				Game.assetsLoaded[file][key] = true;
			});
	},
	start: function() {
		if (typeof start === "function") start(); // should be game method?
		// if (typeof sizeCanvas === "function") sizeCanvas();

		/* draw and update are separates functions 
			because lines draw at relatively slow rate (10fps) 
		*/
		if (Game.stats) Game.initStats();
		if (typeof update === "function") requestAnimFrame(Game.update);
		if (typeof draw === "function") requestAnimFrame(Game.draw);
		if (typeof Events != "undefined") Events.init(Game.canvas);
	},
	draw: function() {
		const time = performance.now();
		if (time >= Game.drawTime + Game.lineInterval) {
			if (Game.clearBg) Game.ctx.clearRect(0, 0, Game.width * Game.dpr, Game.height * Game.dpr);

			// add game scenes ?

			draw(); // draw defined in each game js file
			if (Game.stats) {
				Game.drawFrameRates.push( 1000 / (time - Game.drawTime) );
				Game.statBG();
				Game.drawStat('draw: ' + Math.round( Game.drawFrameRates.reduce((n,s) => n + s) / Game.drawFrameRates.length ), Game.width - 65, 20);
				Game.drawStat('FPS: ' + Math.round( Game.updateFrameRates.reduce((n,s) => n + s) / Game.updateFrameRates.length ), Game.width - 65, 0);
				if (Game.drawFrameRates.length > 20)
					Game.drawFrameRates.shift();
			}
			Game.drawTime = time;
		}
		requestAnimFrame(Game.draw);
	},
	update: function() {
		const time = performance.now();
		if (time > Game.updateTime + Game.updateInterval) {
			update(); // update defined in each game js file
			if (Game.stats) {
				Game.updateFrameRates.push( 1000 / (time - Game.updateTime) );
				
				if (Game.updateFrameRates.length > 20)
					Game.updateFrameRates.shift();
			}
			Game.updateTime = time;
		}
		requestAnimFrame(Game.update); 
	},
	initStats: function() {
		Game.ctx.font = 'lighter 11px sans-serif';
		Game.updateFrameRates = [];
		Game.drawFrameRates = [];
	},
	statBG: function() {
		Game.ctx.fillStyle = 'rgba(0,0,0,0.75)';
		Game.ctx.fillRect(Game.width - 65, 0, 50, 40);
	},
	drawStat: function(s, x, y) {
		Game.ctx.font = 'lighter 11px sans-serif';
		// Game.ctx.clearRect(x, y, 50, 20);
		Game.ctx.beginPath();
		// Game.ctx.rect(x, y, 50, 20);
		// Game.ctx.fill();
		Game.ctx.fillStyle = 'rgba(100,255,200)';
		Game.ctx.fillText(s, x + 5, y + 15);
	},
	addLettering: function(label, json) {
		const letterIndexString = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:?-+'&$;\"";
		Game.lettering[label] = new Anim();
		Game.lettering[label].loadJSON(json);
		for (let i = 0; i < letterIndexString.length; i++) {
			Game.lettering[label].createNewState(letterIndexString[i], i, i);
		}
	},
	setBounds: function(dir, value) {
		Game.bounds[dir] = value;
	}
}

/*
game instance defined functions
start
draw
update
sizeCanvas
mouseClicked(x.y)
mouseMoved(x,y)
*/