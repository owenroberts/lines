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

var fps, frameInterval, frameTimer;
var lps = 15, lineInterval = 1000/lps, lineTimer = Date.now();

var frames = [];
var drawings = [];
var currentframe = 0;
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
				ctx.moveTo( line.s.x + getRandom(-dr, dr), line.s.y + getRandom(-dr, dr) );
				for (var i = 0; i < nr; i++) {
					var p = new Point(line.s.x + v.x * i, line.s.y + v.y * i);
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

		if (Date.now() > frameTimer + frameInterval) {
			frameTimer = Date.now();
			if (currentframe < frames.length) currentframe++;
			if (currentframe == frames.length) currentframe = 0;
		}

		if (Date.now() > lineTimer + lineInterval) {
			lineTimer = Date.now();
			ctx.clearRect(0, 0, w, h);
			if (frames[currentframe]) {
				for (var i = 0; i < frames[currentframe].length; i++) {
					var fr = frames[currentframe][i];
					var dr = drawings[fr.d];
					drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}
		}
	}

	requestAnimationFrame(draw);
};

var loadAnimation = function(_frame) {
	var src = "frames/frame" + _frame + ".json";
	$.getJSON(src, function(data) {
		frames =  data.f;
		drawings = data.d;
		fps = data.fps;
		frameInterval = 1000/fps;
		frameTimer = Date.now();

		currentframe = 0;

		w = data.w;
		h = data.h;

		sizeCanvas();
		playAnimation();
	});
}

var sizeCanvas = function() {
	if (window.innerWidth < w) scale = window.innerWidth / w;
	else scale = 1;
	c.width = Math.min(w * scale, w);
	c.height = Math.min(h * scale, h);
	if (scale != 1) ctx.scale(scale, scale);
}

window.onresize = function() { sizeCanvas() };