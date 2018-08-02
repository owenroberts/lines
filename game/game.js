var Game = {
	init: function(width, height, lps, stats) {
		this.canvas = document.getElementById("lines");
		// update audio new chrome
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
		this.stats = stats;

		this.mixedColors = false; /* param? */

		if (this.canvas.getContext) {
			this.ctx = this.canvas.getContext('2d');
			this.ctx.miterLimit = 1;
			this.canvas.width = this.width;
			this.canvas.height = this.height;
			if (typeof start === "function") start(); // should be game method?
			if (typeof sizeCanvas === "function") sizeCanvas();

			/* draw and update are separates functions 
				because lines draw at relatively slow rate (10fps) */
			if (typeof draw === "function") 
				requestAnimFrame(Game.gDraw);
			if (typeof update === "function") 
				requestAnimFrame(Game.gUpdate);
			Events.init(Game.canvas);
			if (this.stats)
				this.initStats();
		}
	},
	gDraw: function() {
		const time = performance.now();
		if (time > Game.drawTime + Game.lineInterval) {
			Game.ctx.clearRect(0, 0, Game.width, Game.height);
			draw(); // draw defined in each game js file
			if (Game.stats) {
				Game.drawFrameRates.push( 1000 / (time - Game.drawTime) );
				Game.drawStat('d: ' + Math.round( Game.drawFrameRates.reduce((n,s) => n + s) / Game.drawFrameRates.length ), Game.width - 50, 25);
				if (Game.drawFrameRates.length > 20)
					Game.drawFrameRates.shift();
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
				Game.updateFrameRates.push( 1000 / (time - Game.updateTime) );
				Game.drawStat('u: ' + Math.round( Game.updateFrameRates.reduce((n,s) => n + s) / Game.updateFrameRates.length ), Game.width - 50, 0);
				if (Game.updateFrameRates.length > 20)
					Game.updateFrameRates.shift();
			}
			Game.updateTime = time;
		}
		requestAnimFrame(Game.gUpdate); 
	},
	initStats: function() {
		Game.ctx.font = '16px sans-serif';
		Game.updateFrameRates = [];
		Game.drawFrameRates = [];
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