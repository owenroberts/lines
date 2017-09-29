/*

dr.l is an array of all the lines in the drawing
dr.l[0].s is vector for start of line
dr.l[0].e is vector for beinning of line
fr.d is drawing index
fr.i is start index for lines of drawing
fr.e is end index of lines of drawing
dr.n is segment n
dr.r is randomness of wiggle
dr.c is color of all lines in drawing

this.drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
*/

const c = document.querySelector('canvas');
const ctx = c.getContext('2d');
ctx.miterLimit = 1;
let w, h; // w h of drawing, not canvas
let scale = 1;

let currentFrame = 0; // always int, floor cfc
let currentFrameCounter = 0; // uses intervalRatio, so it's a float
let playing = true;

let fps = 15;
let lineInterval = 1000/fps;
let timer = performance.now();
let intervalRatio = lineInterval / (1000 / fps);  // initialize to one but this is the math

let frames = [];
let drawings = [];
let ctxStrokeColor;
let mixedColors = false;

function draw() {
	requestAnimFrame(draw);
	if (performance.now() > lineInterval + timer) {
		timer = performance.now();
		if (playing && currentFrameCounter < frames.length) {
			currentFrameCounter += intervalRatio;
			currentFrame = Math.floor(currentFrameCounter);
		}
		if (playing && currentFrame == frames.length) {
			currentFrame = currentFrameCounter = 0;
		}
		ctx.clearRect(0, 0, w, h);
		if (frames[currentFrame]) {
			if (!mixedColors)
				ctx.beginPath();
			for (let i = 0; i < frames[currentFrame].length; i++) {
				const fr = frames[currentFrame][i];
				const dr = drawings[fr.d];
				if (mixedColors)
					ctx.beginPath();
				for (let h = fr.i; h < fr.e; h++) {
					let line = dr.l[h];
					if (line && line.e) {
						let v = new Vector(line.e.x, line.e.y);
						v.subtract(line.s);
						v.divide(dr.n);
						ctx.moveTo( line.s.x + getRandom(-dr.r, dr.r), line.s.y + getRandom(-dr.r, dr.r) );
						for (let j = 0; j < dr.n; j++) {
							let p = new Vector(line.s.x + v.x * j, line.s.y + v.y * j);
							ctx.lineTo( p.x + v.x + getRandom(-dr.r, dr.r), p.y + v.y + getRandom(-dr.r, dr.r) );
						}
						if (ctxStrokeColor != dr.c) {
							ctxStrokeColor = dr.c;
							ctx.strokeStyle= "#" + ctxStrokeColor;
						}
					}				
				}
				if (mixedColors)
					ctx.stroke();
			}
			if (!mixedColors)
				ctx.stroke();
		}
	}
}

function loadAnimation(src, callback) {
	$.getJSON(src, function(data) {
		frames =  data.f;
		drawings = data.d;
		fps = data.fps;
		intervalRatio = lineInterval / (1000 / fps);
		currentFrame = 0;
		w = data.w;
		h = data.h;
		c.width = data.w;
		c.height = data.h;
		requestAnimFrame(draw);
		if (callback)
			callback();
	});
}