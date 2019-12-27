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

		this.bounds = { top: 0, bottom: 0, left: 0, right: 0 };

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
	load: function(files, classes, callback) {
		Game.classes = classes;
		Game.assetsLoaded = {};
		for (const f in files) {
			const file = files[f];
			Game.assetsLoaded[f] = false;
			fetch(file)
				.then(response => {
					if (response.ok) return response.json();
					throw new Error('Network response was not ok.');
				})
				.then(json => {
					Game.assetsLoaded[f] = true;
					Game.loadSprites(f, json);
				})
				.catch(error => {
					console.error(error);
					Game.assetsLoaded[f] = true;
				});
		}

		const loader = setInterval(function() {
			if (Object.keys(Game.assetsLoaded).every(key => { return Game.assetsLoaded[key]; })) {
				clearInterval(loader);
				if (callback) callback();
			}
		}, 1000 / 60);
	},
	loadSprites: function(file, json) {
		Game.traverse(json, [], function(key, value, path) {
			let location = Game[file];
			for (let i = 0; i < path.length; i++) {
				const loc = path[i];
				if (!location[loc]) location[loc] = {};
				location = location[loc];
			}
			const type = path.pop();
			const params = { label: key, ...value };
			location[key] = new Game.classes[type](params);

			/* update game boundaries */
			function setBounds(position) {
				if (position.y < Game.bounds.top) 
					Game.bounds.top = position.y;
				if (position.y > Game.bounds.bottom) 
					Game.bounds.bottom = position.y + Game.height;
				if (position.x > Game.bounds.right) 
					Game.bounds.right = position.x + Game.width/2;
				if (position.x < Game.bounds.left) 
					Game.bounds.left = position.x - Game.width/2;
			}

			if (location[key].position) {
				setBounds(location[key].position);				
			} else if (location[key].locations) {
				for (let i = 0; i < location[key].locations.length; i++) {
					setBounds(location[key].locations[i]);
				}
			}

			for (let i = 0; i < location[key].scenes.length; i++) {
				const scene = location[key].scenes[i];
				if (!Game.scenes.includes(scene)) Game.scenes.push(scene);
			}
		});
	},
	traverse: function(o, path, callback) {
		for (const k in o) {
			if (o[k].src) {
				callback(k, o[k], [...path]);
			} else if (o[k] !== null && typeof(o[k]) == 'object') {
				Game.traverse(o[k], [...path, k], callback);
			}
		}
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
			if (Game.clearBg) Game.ctx.clearRect(0, 0, Game.width * Game.dpr, Game.height * Game.dpr);
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