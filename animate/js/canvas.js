function Canvas(width, height, color) {
	const self = this;

	this.width = width;
	this.height = height;
	this.canvas = document.getElementById("canvas"); // Lines.canvas.canvas is html elem
	
	this.ctx = this.canvas.getContext('2d');
	this.ctx.miterLimit = 1;

	this.bgColor = new Color("canvas-color", "Canvas Color", function(color) {
		self.canvas.style.backgroundColor = "#" + color;
	});

	/* canvas bg color */
	if (color) {
		self.bgColor.color = color;
		self.canvas.style.backgroundColor = "#" + color;
	}

	/* set line color */
	this.setStrokeColor = function(color) {
		this.ctx.strokeStyle = "#" + color;
	};

	/* update canvas width */
	this.setWidth = function(width) {
		if (Number(width)) {
			self.width = self.canvas.width = width;
		} else {
			if (self.widthInput.getValue()) 
				self.width = self.canvas.width = self.widthInput.getValue();
			else if (!self.width)
				console.error("No width value set?");
		}
		self.ctx.miterLimit = 1;
	};

	/* update canvas height */
	this.setHeight = function(height) {
		if (Number(height)) {
			self.height = self.canvas.height = height;
		} else {
			if (self.heightInput.getValue()) 
				self.height = self.canvas.height = self.heightInput.getValue();
			else if (!self.height)
				console.error("No height value set?");
		}
		self.ctx.miterLimit = 1;
	};
	
	/* set initial width and height */
	this.setWidth(this.width);
	this.setHeight(this.height);

	this.capture = function() {
		if (Lines.draw.background.img.src) {
			console.log(Lines.draw.background.img.src)
			Lines.draw.background.img.src = "";
			console.log(Lines.draw.background.img.src)
		}
		if (Lines.fio.saveFilesEnabled) {
			canvas.toBlob(function(blob) {
				saveAs(blob, Lines.fio.title.getValue() + "-" + Cool.padNumber(Lines.currentFrame, 3) + ".png");
			});
		} else {
			const cap = self.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href = cap;
		}
	};

	/* shift-f key */
	this.fitCanvasToDrawing = function() {
		Lines.data.saveLines();
		
		let tolerance = 0;
		let minx = 10000;
		let maxx = 0;
		let miny = 10000;
		let maxy = 0;

		for (let i = 0; i < Lines.drawings.length; i++) {
			if (Lines.drawings[i] != "x") { /* remove all "x" stuff in v2 */
				for (let j = 0; j < Lines.drawings[i].l.length; j++) {
					if (Lines.drawings[i].l[j].e && Lines.drawings[i].l[j].s) {

						tolerance = Math.max( tolerance, Lines.drawings[i].r * 4 );

						minx = Math.min( minx, Lines.drawings[i].l[j].e.x );
						miny = Math.min( miny, Lines.drawings[i].l[j].e.y );
						minx = Math.min( minx, Lines.drawings[i].l[j].s.x );
						miny = Math.min( miny, Lines.drawings[i].l[j].s.y );

						maxx = Math.max( maxx, Lines.drawings[i].l[j].e.x );
						maxy = Math.max( maxy, Lines.drawings[i].l[j].e.y );
						maxx = Math.max( maxx, Lines.drawings[i].l[j].s.x );
						maxy = Math.max( maxy, Lines.drawings[i].l[j].s.y );

					}	
				}
			}
		}

		self.setWidth((maxx - minx) + tolerance * 2);
		self.setHeight((maxy - miny) + tolerance * 2);

		for (let i = 0; i < Lines.drawings.length; i++) {
			if (Lines.drawings[i] != "x"){
				for (var j = 0; j < Lines.drawings[i].l.length; j++) {
					if (Lines.drawings[i].l[j].e && Lines.drawings[i].l[j].s) {
						Lines.drawings[i].l[j].e.x -= minx - tolerance;
						Lines.drawings[i].l[j].e.y -= miny - tolerance;
						Lines.drawings[i].l[j].s.x -= minx - tolerance;
						Lines.drawings[i].l[j].s.y -= miny - tolerance;
					}	
				}
			}
		}
	};

	/* interface */
	const panel = new Panel("canvasmenu", "Canvas");

	/* update canvas width */
	this.widthInput = new UIText({
		id: "canvas-width",
		placeholder: this.width,
		label: "Width",
		blur: true,
		observe: {
			elem: self.canvas,
			attribute: "width"
		},
		callback: function(ev) {
			if (ev) { // key input
				if (ev.which == 13) {
					self.setWidth();
					self.widthInput.reset(self.width);
					this.blur();
				}
			} else { // observer
				self.widthInput.reset(Lines.canvas.canvas.width);
			}
		}
	});
	panel.add(this.widthInput);
	
	/* update canvas height */
	this.heightInput = new UIText({
		id: "canvas-height",
		placeholder: this.height,
		label: "Height",
		blur: true,
		observe: {
			elem: self.canvas,
			attribute: "height"
		},
		callback: function(ev) {
			if (ev) { // key input
				if (ev.which == 13) {
					self.setHeight();
					self.heightInput.reset(self.height);
					this.blur();
				}
			} else { // observer 
				self.heightInput.reset(Lines.canvas.canvas.height);
			}
		}
	});
	panel.add(this.heightInput);

	panel.add( new UIButton({
		title: "Fit Canvas to Drawing",
		callback: self.fitCanvasToDrawing,
		key: "shift-f"
	}) );
}