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

		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps
		this.drawTime = performance.now();
		this.stats = params.stats || false;

		this.mixedColors = params.mixedColors || false; /* param? */
		this.debug = params.debug || false;

		this.clearBg = true;

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			
			this.canvas.width = this.width;
			this.canvas.height = this.height;

			if (params.lineColor) this.ctx.strokeStyle = params.lineColor;
			if (params.scale) this.ctx.scale(params.scale, params.scale);

			this.ctx.miterLimit = 1;
		}

		this.loaded = {}; /* auto save loaded json sprites */
	},
	load: function(files, handler, callback) {
		Game.assetsLoaded = {};
		for (const f in files) {
			const file = files[f];
			Game.assetsLoaded[f] = false;
			fetch(file)
				.then(response => { return response.json() })
				.then(json => {
					Game.assetsLoaded[f] = true;
					handler(f, json); /* game loaded to specific scenes, editor loads to generic sprites */
				});
		}

		const loader = setInterval(function() {
			if (Object.keys(Game.assetsLoaded).every(key => { return Game.assetsLoaded[key]; })) {
				clearInterval(loader);
				if (callback) callback();
			}
		}, 1000 / 60);
	},
	start: function() {
		if (typeof start === "function") start(); // should be game method?
		if (typeof sizeCanvas === "function") sizeCanvas();

		/* draw and update are separates functions 
			because lines draw at relatively slow rate (10fps) */
		if (typeof draw === "function") requestAnimFrame(Game.draw);
		if (typeof update === "function") requestAnimFrame(Game.update);
		if (typeof Events != "undefined") Events.init(Game.canvas);
		if (this.stats) this.initStats();
	},
	draw: function() {
		const time = performance.now();
		if (time > Game.drawTime + Game.lineInterval) {
			if (Game.clearBg) Game.ctx.clearRect(0, 0, Game.width, Game.height);
			draw(); // draw defined in each game js file
			if (Game.stats) {
				Game.drawFrameRates.push( 1000 / (time - Game.drawTime) );
				Game.drawStat('lps: ' + Math.round( Game.drawFrameRates.reduce((n,s) => n + s) / Game.drawFrameRates.length ), Game.width - 65, 20);
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
				Game.drawStat('fps: ' + Math.round( Game.updateFrameRates.reduce((n,s) => n + s) / Game.updateFrameRates.length ), Game.width - 65, 0);
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
	drawStat: function(s, x, y) {
		Game.ctx.font = 'lighter 11px sans-serif';
		Game.ctx.clearRect(x, y, 50, 20);
		Game.ctx.beginPath();
		Game.ctx.rect(x, y, 50, 20);
		Game.ctx.fillStyle = 'rgba(0,0,0,0.25)';
		Game.ctx.fill();
		Game.ctx.fillStyle = 'rgba(100,255,200)';
		Game.ctx.fillText(s, x + 5, y + 15);
	},
	initLettering: function(src) {
		/* data should be in json file or something */
		const map = { "a": 0, "b": 1, "c": 2, "d": 3, "e": 4, "f":5, "g":6, "h":7, "i":8, "j":9, "k":10, "l":11, "m":12, "n":13, "o":14, "p":15, "q":16, "r":17, "s":18, "t":19, "u":20, "v":21, "w":22, "x":23, "y":24, "z":25, "0":26, "1":27, "2":28, "3":29, "4":30, "5":31, "6":32, "7":33, "8":34, "9":35, ".":36, ",":37, ":":38, "?":39, "E":40, "F":41, "A":42, "S":43, "D":44, "W":45, "{" :46, "}": 47, "-": 48, "+": 49, "M": 50, "J": 51, "K": 52, "L": 53, "Q": 54, "'": 55 };
		
		Game.letters = new Anim();
		Game.letters.load(src);
		for (const key in map) {
			Game.letters.createNewState(key, map[key], map[key]);
		}
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