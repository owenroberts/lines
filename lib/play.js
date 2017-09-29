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

var c = document.querySelector('canvas');
var wrap = c.parentNode;
var ctx = c.getContext('2d');
var w, h;
var scale = 1;

var currentFrame = 0;
var currentFrameCounter = 0;
var playing = false;
var fps = 10;
var lineInterval = 1000/10;
var timer = performance.now();
var intervalRatio = lineInterval / (1000 / fps);

var frames = [];
var drawings = [];
var playing = true;

var playAnimation = function() {

	var drawLines = function(lns, index, end, nr, dr, col) {
		for (var h = index; h < end; h++) {
			var line = lns[h];
			if (line && line.e) {
				var v = new Vector(line.e.x, line.e.y);
				v.subtract(line.s);
				v.divide(nr);
				ctx.beginPath();
				ctx.miterLimit = 1;
				ctx.moveTo( line.s.x + getRandom(-dr, dr), line.s.y + getRandom(-dr, dr) );
				for (var i = 0; i < nr; i++) {
					var p = new Vector(line.s.x + v.x * i, line.s.y + v.y * i);
					ctx.lineTo( p.x + v.x + getRandom(-dr, dr), p.y + v.y + getRandom(-dr, dr) );
				}
				ctx.strokeStyle= "#"+col;
	      		ctx.stroke();
			}
		}				
	}

	/*  DRAW  */
	var draw = function() {
		requestAnimationFrame(draw);
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
				for (var i = 0; i < frames[currentFrame].length; i++) {
					var fr = frames[currentFrame][i];
					var dr = drawings[fr.d];
					drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}
		}
	}

	requestAnimationFrame(draw);
};

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
		playAnimation();
		if (callback)
			callback();
	});
}