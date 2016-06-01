//http://www.html5canvastutorials.com/tutorials/html5-canvas-lines/

var lines = [];
var c = document.querySelector('#canvas');
var w = c.width;
var h = c.height;
var ctx = c.getContext('2d');
var numRange = 40;
var diffRange = 4;

var drawOn = false;
var mode = "drawmode";

$('#linemode').on('click', function() { 
	mode = "linemode";
	$('.btn').css('background', 'transparent');
	$(this).css('background', 'lightgray');
});
$('#drawmode').on('click', function() { 
	mode = "drawmode";
	$('.btn').css('background', 'transparent');
	$(this).css('background', 'lightgray');
	clicks=0;
});

$('#num').on('change', function() {
	console.log(this.value);
	numRange = this.value;
});
$('#diff').on('change', function() {
	diffRange = this.value;
});

var clicks = 0;
c.addEventListener('mousemove', function(event) {
	if (drawOn && mode == "drawmode") {
		var mx = event.offsetX;
		var my = event.offsetY;

		if (clicks > 0) {
			lines.push({
				start: {_x: mx, _y:my},
				num: getRandom(2,numRange/4),
				diff: getRandom(diffRange/2,diffRange)
			});
			lines[lines.length - 2].end = {_x:mx, _y:my};
		} else {
			lines.push({
				start: {_x: mx, _y:my},
				num: getRandom(2,numRange/4),
				diff: getRandom(diffRange/2,diffRange)
			});
		}
		clicks++;
	}
});

c.addEventListener('mousedown', function(event) {
	if (event.which == 1) drawOn = true;
	if (mode == "linemode") {
		var mx = event.offsetX;
		var my = event.offsetY;
		if (clicks%2 == 0) {
			lines.push({
				start: {_x: mx, _y:my},
				num: getRandom(numRange/2,numRange),
				diff: getRandom(diffRange/2,diffRange)
			});
		} else {
			lines[lines.length - 1].end = {_x:mx, _y:my};
		}
		clicks++;
	}
});

c.addEventListener('mouseup', function(event) {
	if (event.which == 1) drawOn = false;
	if (mode == "drawmode") {
		if (clicks%2==1) {
			lines.splice(-1,1);
		}
		clicks = 0;
	}
});

var fps = 10;
var interval = 1000/fps;
var timer = Date.now();

function draw() {
	requestAnimationFrame(draw);
	if (Date.now() > timer + interval) {
		timer = Date.now();
		ctx.canvas.width = ctx.canvas.width;
		for (var h = 0; h < lines.length; h++) {
			var line = lines[h];
			if (line.end) {
				var xdiff = line.start._x - line.end._x;
				var ydiff = line.start._y - line.end._y;
				ctx.beginPath();
				for (var i = 0; i < line.num; i++) {
					ctx.lineTo(
						line.end._x + (xdiff/line.num*i) + Math.random() * line.diff,  
						line.end._y + (ydiff/line.num*i) + Math.random() * line.diff
					);
				}
	      		ctx.stroke();
			}
			
		}
	}
}
requestAnimationFrame(draw);

if (window.File && window.FileReader && window.FileList && window.Blob) {
	console.log("Save file");
}

$('#save').on('click', function() { 
	var jsonfile = '{"lines":' + JSON.stringify(lines) + '}';
	var filename = prompt("Name this file:");

	var blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
	saveAs(blob, filename+".json");
});

$('#mail').on('click', function(e) {
	e.preventDefault();
	var body = JSON.stringify(lines);
	window.open(this.href+"&body="+body, "blank");
	//window.location = this.href+"?body="+body;
});