var Game = {
	init: function(width, height, lps) {
		this.canvas = document.getElementById("lines");
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioCtx = new AudioContext();
		
		/* some kind of setup for this? */
		this.width = width;
		this.height = height;
		this.lineInterval = 1000/lps;
		this.currentScene = 0;

		this.updateTime = performance.now();
		this.updateInterval = 1000 / 60; // 60 fps
		this.drawTime = performance.now();
		this.stats = true;

		this.mixedColors = true;

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.ctx.miterLimit = 1;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			if (typeof start === "function") start(); // should be game method?
			if (typeof sizeCanvas === "function") sizeCanvas();

			/* draw and update are separates functions 
				because lines draw at relatively slow rate (10fps) */
			if (typeof draw === "function") requestAnimFrame(Game.gDraw);
			if (typeof update === "function") requestAnimFrame(Game.gUpdate);
			Events.init(Game.canvas);
			if (this.stats)
				this.initStats();
		}

		/* events */
		this.canvas.addEventListener('click', function(ev) {
			ev.preventDefault();
			if (typeof mouseClicked === "function") 
				mouseClicked(ev.offsetX, ev.offsetY);
		}, false);

		this.canvas.addEventListener('mousedown', function(ev) {
			ev.preventDefault();
			if (typeof mouseDown === "function") 
				mouseDown(ev.offsetX, ev.offsetY);
		}, false);

		this.canvas.addEventListener('mouseup', function(ev) {
			ev.preventDefault();
			if (typeof mouseUp === "function") 
				mouseUp(ev.offsetX, ev.offsetY);
		}, false);

		this.canvas.addEventListener('mousemove', function(ev) {
			if (typeof mouseMoved === "function") 
				mouseMoved(ev.offsetX, ev.offsetY);
		}, false);

		document.addEventListener('keydown', function(ev) {
			if (typeof keyDown === "function") 
				keyDown(Cool.keys[ev.which]);
		});
		document.addEventListener('keyup', function(ev) {
			if (typeof keyUp === "function") 
				keyUp(Cool.keys[ev.which]);
		});

		window.addEventListener('resize', function(ev) {
			if (typeof sizeCanvas === "function") 
				sizeCanvas();
		}, false);
	},
	gDraw: function() {
		const time = performance.now();
		if (time > Game.drawTime + Game.lineInterval) {
			Game.ctx.clearRect(0, 0, Game.width, Game.height);
			draw(); // draw defined in each game js file
			if (Game.stats) {
				const fps = 1000 / (time - Game.drawTime);
				Game.drawStat('d: ' + Math.round(fps), Game.width - 50, 25);
			}
			Game.drawTime = time;
		}
		requestAnimFrame(Game.gDraw);
	},
	gUpdate: function() {
		const time = performance.now();
		if (time > Game.updateTime + Game.updateInterval) {
			update(); // update defined in each game js file
			if (Game.stats) {
				const fps = 1000 / (time - Game.updateTime);
				Game.drawStat('g: ' + Math.round(fps), Game.width - 50, 0);
			}
			Game.updateTime = time;
		}
		requestAnimFrame(Game.gUpdate); 
	},
	initStats: function() {
		Game.ctx.font = '16px sans-serif';
	},
	drawStat: function(s, x, y) {
		Game.ctx.clearRect(x, y, 50, 25);
		Game.ctx.beginPath();
		Game.ctx.rect(x, y, 50, 25);
		Game.ctx.fillStyle = 'rgba(0,0,0,0.25)';
		Game.ctx.fill();
		Game.ctx.fillStyle = 'rgba(100,255,200)';
		Game.ctx.fillText(s, x + 10, y + 15);
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