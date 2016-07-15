var c = document.querySelector('canvas');
var wrap = c.parentNode;
var ctx = c.getContext('2d');

var fps, interval, frameTimer;
var lps = 1000/15, lineTimer = Date.now();

var frames = [];
var drawings = [];
var currentframe = 0;
var playing = true;

var playAnimation = function() {

	var drawLines = function(lns, index, end, nr, dr, col) {
		for (var h = index; h < end; h++) {
			var line = lns[h];
			if (line && line.e) {
				var v = new Vector(line.e, line.s);
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

		if (Date.now() > timer + interval) {
			timer = Date.now();
			if (currentframe < frames.length) currentframe++;
			if (currentframe == frames.length) currentframe = 0;
		}

		if (Date.now() > lineTimer + lps) {
			lineTimer = Date.now();
			ctx.canvas.width = ctx.canvas.width;
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

var loadAnimation = function() {
	var src = c.dataset.src;
	$.getJSON(src, function(data) {
		console.log("loaded");
		frames =  data.f;
		drawings = data.d;
		fps = data.fps;
		interval = 1000/fps;
		timer = Date.now();

		c.width = data.w;
		c.height = data.h;
		
		playAnimation();
		sizeCanvas();
	});
}

var sizeCanvas = function() {
	var ratio = wrap.offsetWidth / wrap.offsetHeight;
	var z = 1;
	if (wrap.offsetWidth < Number(canvas.width)) z = wrap.offsetWidth / canvas.width;
	canvas.style.zoom = z;
}

window.onresize = function() { sizeCanvas() };
