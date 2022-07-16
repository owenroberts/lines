/*
	canvas module
*/

function Canvas(app, params) {
	Object.assign(Canvas.prototype, ModuleMixin);
	const self = this;

	this.canvas = document.getElementById(params.id);
	this.ctx = this.canvas.getContext('2d');
	
	let dpr = params.checkRetina ? window.devicePixelRatio || 1 : 1;
	let lineWidth = params.lineWidth || 1; // to keep value from getting reset
	let scale = params.scale || 1;
	let width = this.canvas.width;
	let height = this.canvas.height;
	
	this.addProp('scale', {
		get: () => { return scale; },
		set: (value) => {
			scale = +value;
			self.updateSize();
		}
	});

	this.addProp('width', {
		get: () => { return width; },
		set: (value) => {
			width = +value;
			self.updateSize();
		}
	});

	this.addProp('height', {
		get: () => { return height; },
		set: (value) => {
			height = +value;
			self.updateSize();
		}
	});

	this.addProp('lineWidth', {
		get: () => { return lineWidth; },
		set: (value) => {
			lineWidth = +value;
			self.reset();
		}
	});

	this.updateSize = function() {
		self.canvas.width = width * dpr * scale;
		self.canvas.height = height * dpr * scale;
		self.reset();
	};

	this.reset = function() {
		// cross browser scaling -- need to test this -- ctx scale doesn't work in firefox but fine in chrome so fine for editing -- only necessary in production ...
		self.canvas.style.width = width * scale + 'px';
		self.canvas.style.height = height * scale + 'px';

		// reset these values
		self.ctx.lineWidth = lineWidth;
		self.ctx.miterLimit = 1;
		self.ctx.lineCap = 'round';
		self.ctx.lineJoin = 'round';
	};
}