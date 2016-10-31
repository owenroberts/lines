(function playAnimation() {
	
	var c = document.querySelector('canvas');

	var ctx = c.getContext('2d');
	var src = c.dataset.src;
	var fps = c.dataset.fps;

	var interval = 1000/fps;
	var timer = Date.now();

	var frames = [];
	var drawings = [];
	var currentframe = 0;
	var playing = true;

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
			ctx.canvas.width = ctx.canvas.width;
			if (currentframe < frames.length) currentframe++;
			if (currentframe == frames.length) currentframe = 0;
			if (frames[currentframe]) {
				for (var i = 0; i < frames[currentframe].length; i++) {
					var fr = frames[currentframe][i];
					var dr = drawings[fr.d];
					drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
				}
			}

			/*for (var i = 0; i < clips.length; i++) {
				if (currentframe == clips[i].start) clips[i].audio.play();
			}*/
		}
	}

	requestAnimationFrame(draw);

	$.getJSON(src, function(data) {
		frames =  data.f;
		drawings = data.d;

		//var ratio = m.offsetWidth / m.offsetHeight;
		//var z = 1;
		//if (m.offsetWidth < Number(data.w)) z = m.offsetWidth / data.w;
		c.width = data.w;
		c.height = data.h;
		//c.style.zoom = z;
	});
})();