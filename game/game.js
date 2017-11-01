var Game = {
	init: function(width, height, fps) {
		this.canvas = document.getElementById("lines");
		window.AudioContext = window.AudioContext || window.webkitAudioContext;
		this.audioCtx = new AudioContext();
		
		/* some kind of setup for this? */
		this.width = width;
		this.height = height;
		this.lineInterval = 1000/fps;
		this.currentScene = 0;

		this.updateTime = performance.now();
		this.drawTime = performance.now();
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
		}

		/* events */
		this.canvas.addEventListener('click', function(ev) {
			ev.preventDefault();
			if (typeof mouseClicked === "function") mouseClicked(ev.offsetX, ev.offsetY);
		}, false);

		this.canvas.addEventListener('mousemove', function(ev) {
			if (typeof mouseMoved === "function") mouseMoved(ev.offsetX, ev.offsetY);
		}, false);

		window.addEventListener('resize', function(ev) {
			if (typeof sizeCanvas === "function") sizeCanvas();
		}, false);
	},
	gDraw: function() {
		if (performance.now() > Game.drawTime + Game.lineInterval) {
			Game.drawTime = performance.now();
			Game.ctx.clearRect(0, 0, Game.width, Game.height);
			draw(); // draw defined in each game js file
		}
		requestAnimFrame(Game.gDraw);
	},
	gUpdate: function() {
		update();
		requestAnimFrame(Game.gUpdate);
	},
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