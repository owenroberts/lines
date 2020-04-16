function Canvas(id, _width, _height, color, checkRetina) {
	const self = this;

	/* width and height are pixel dimensions
		canvas width and height are dependent on dpr */
	this.canvas = document.getElementById(id); // lns.canvas.canvas is html elem
	this.dpr = checkRetina ? window.devicePixelRatio || 1 : 1;
	this.scale = 1;

	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;
	this.lineWidth = 1; // to keep value from getting reset

	this.setBGColor = function(color) {
		self.bgColor = color;
		self.canvas.style.backgroundColor = color;
	};

	this.setBGColor(color);

	this.setLineWidth = function(n) {
		self.ctx.lineWidth = self.lineWidth = +n;
		self.ctx.miterLimit = 1;
	};

	this.setScale = function(n) {
		self.scale = +n;
		self.setWidth(self.width);
		self.setHeight(self.height);
	};

	/* update canvas width */
	this.setWidth = function(width) {
		self.width = +width;
		self.canvas.width = +width * self.dpr * self.scale;
		self.reset();
	};

	/* update canvas height */
	this.setHeight = function(height) {
		self.height = +height;
		self.canvas.height = +height * self.dpr * self.scale;
		self.reset();
	};

	this.reset = function() {
		// https://www.html5rocks.com/en/tutorials/canvas/hidpi/
		self.ctx.scale(1, 1); // prevent multiple scales
		self.ctx.scale(this.dpr * self.scale, self.dpr * self.scale);
		self.canvas.style.zoom = 1 / self.dpr;
		self.ctx.lineWidth = self.lineWidth;
		self.ctx.miterLimit = 1;
	};
	
	/* set initial width and height */
	this.setWidth(_width);
	this.setHeight(_height);

	/* shift-f key */
	this.fitCanvasToDrawing = function() {
		lns.draw.reset();
		
		let tolerance = 0;
		let min = { x: 10000, y: 10000 }; // min max size of canvas
		let max = { x: 0, y: 0 };

		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const drawing = lns.anim.drawings[layer.d];
			for (let j = 0; j < drawing.length; j++) {
				const point = drawing[j];
				if (point != 'end') {
					tolerance = Math.max(tolerance, layer.r * 4); /* account for random jiggle */
					min.x = Math.min(min.x, point.x + layer.x);
					min.y = Math.min(min.y, point.y + layer.y);
					max.x = Math.max(max.x, point.x + layer.x);
					max.y = Math.max(max.y, point.y + layer.y);
				}
			}
		}

		// example of this syntax being counter intuitive/annoying
		lns.ui.faces.width.update((max.x - min.x) + tolerance * 2);
		lns.ui.faces.height.update((max.y - min.y) + tolerance * 2);

		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			lns.anim.layers[i].x -= min.x - tolerance > 0 ? min.x - tolerance : 0;
			lns.anim.layers[i].y -= min.y - tolerance > 0 ? min.y - tolerance : 0;
		}
	};
}