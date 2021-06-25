function Zoom() {
	const self = this;

	this.canvas = {
		width: undefined,
		height: undefined
	}; /* actual canvas size */
	
	this.view = {
		x: 0,
		y: 0,
		width: undefined,
		height: undefined
	}; /* size and offset of viewed canvas */

	this.previous = {
		x: undefined,
		y: undefined
	}; /* previous position for panning */

	this.mouseDown = false;

	this.clear = function(ctx) {
		ctx.setTransform(1,0,0,1,0,0);
	};

	this.set = function(ctx, offset) {
		ctx.scale((this.canvas.width / this.view.width) * GAME.dpr, (this.canvas.height / this.view.height) * GAME.dpr);
		ctx.translate(offset.x - this.view.x, offset.y - this.view.y);
	};

	this.wheel = function(ev, callback) {
		const x = this.view.width / 2 + this.view.x;  // View coordinates
		const y = this.view.height / 2 + this.view.y;

		const scale = (event.wheelDelta < 0 || event.detail > 0) ? 1.1 : 0.9;
		this.view.width *= scale;
		this.view.height *= scale;

		// scale about center of view, rather than mouse position. This is different than dblclick behavior.
		this.view.x = x - this.view.width / 2;
		this.view.y = y - this.view.height / 2;

		if (callback) callback();
	};

	this.getDelta = function(x, y) {
		return { 
			x: (x - this.previous.x) / this.canvas.width * this.view.width,
			y: (y - this.previous.y) / this.canvas.height * this.view.height
		};
	};

	this.updateView = function(x, y) {
		this.view.x -= x;
		this.view.y -= y;
	};

	this.updatePrevious = function(x, y) {
		this.previous.x = x;
		this.previous.y = y;
	};

	this.save = function() {
		localStorage.zoom = JSON.stringify({ 
			view: self.view, 
			previous: self.previous, 
		});
	};

	this.load = function() {
		if (localStorage.zoom) {
			const zoom = JSON.parse(localStorage.zoom);
			for (const key in zoom) {
				self[key] = zoom[key];
			}
		}
	};

	this.center = function() {
		self.canvas = { width: GAME.width, height: GAME.height };
		self.view = { x: 0, y: 0, width: GAME.width, height: GAME.height };
		self.previous = { x: undefined, y: undefined }; 
	};

	this.translate = function(x, y) {
		const scale = self.canvas.width / self.view.width;
		x = x / scale + self.view.x - GAME.width/2;
		y = y / scale + self.view.y - GAME.height/2;
		return {x: Math.round(x), y: Math.round(y)};
	};

	/* based on zoom: http://www.cs.colostate.edu/~anderson/newsite/javascript-zoom.html*/
}