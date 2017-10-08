/*
animation module
http://www.html5canvastutorials.com/tutorials/html5-canvas-lines/
*/

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

const c = document.querySelector('#canvas');
var w = c.width;
var h = c.height;
const ctx = c.getContext('2d');
var bkg = new Image();
var bkgx = 0, bkgy = 0, bkgSize = 0, bkgRatio = 1;
var title = document.getElementById("title");

var frames = [];
var copyFrames = [];
var selecting = false;

var lines = [];  // the lines currently being drawn
var copy = [];
var linesCopy = [];
var drawings = []; // save drawings here and reference them

var numSaveStates = 10;
var saveStates = [{d:[],f:[]}];

var currentFrame = 0;
var currentFrameCounter = 0;
var playing = false;
var fps = 10;
var lineInterval = 1000/fps;
var timer = performance.now();
var intervalRatio = lineInterval / (1000 / fps);

var onionskin = 0;
var moves = 0;

var drawOn = false;
var addlines = false;

var numRange = $('#num')[0].value;
var diffRange = $('#diff')[0].value;
$('#num-range').text(numRange);
$('#diff-range').text(diffRange);

var mousetime = 30;
var mousetimer = 0;
$('#mouse-range').text(mousetime);
$('#mouse').on('change', function() {
	mousetime = Number(this.value);
	$('#mouse-range').text(mousetime);
});

$('#fps').on('change', function() {
	fps = this.value;
	intervalRatio = lineInterval / (1000 / fps);
	this.blur();
});

$('#num').on('change', function() {
	numRange = this.value;
	$('#num-range').text(numRange);
});
$('#diff').on('change', function() {
	diffRange = this.value;
	$('#diff-range').text(diffRange);
});

/* COLOR STUFF */
var colorPreview = document.querySelector("#color");
var colorGradient = document.querySelector("#color-gradient");
colorPreview.style.backgroundColor = "#" + color;
colorGradient.style.backgroundColor = "#" + color;
var hue = document.querySelector("#hue");
var sat = document.querySelector("#saturation");
var light = document.querySelector("#lightness");
var pckrs = document.getElementsByClassName("pckr");
var htmlColor = document.querySelector("#html-color");
var color = htmlColor.value; // updated for the future penis
var colors = [];
updateColor();

function updateColor() {
	var co = "hsl(" + hue.value + "," + sat.value + "%," + light.value + "%)";
	color = hslToHex(co);
	htmlColor.value = color;
	colorPreview.style.backgroundColor = "#" + color;
	colorGradient.style.backgroundImage = "linear-gradient(to right, hsl(0,"+sat.value+"%,"+light.value+"%),hsl(60,"+sat.value+"%,"+light.value+"%), hsl(120,"+sat.value+"%,"+light.value+"%), hsl(180,"+sat.value+"%,"+light.value+"%), hsl(240,"+sat.value+"%,"+light.value+"%),hsl(300,"+sat.value+"%,"+light.value+"%) 100%)";
}

function updatePckrs() {
	var hsl = rgbToHsl(hexToRgb(color));
	hue.value = hsl[0];
	sat.value = hsl[1];
	light.value  = hsl[2];
	colorGradient.style.backgroundImage = "linear-gradient(to right, hsl(0,"+sat.value+"%,"+light.value+"%),hsl(60,"+sat.value+"%,"+light.value+"%), hsl(120,"+sat.value+"%,"+light.value+"%), hsl(180,"+sat.value+"%,"+light.value+"%), hsl(240,"+sat.value+"%,"+light.value+"%),hsl(300,"+sat.value+"%,"+light.value+"%) 100%)";
}

for (let i = 0; i < pckrs.length; i++) {
	pckrs[i].addEventListener("input", updateColor);
}
htmlColor.addEventListener("keyup", function(e) {
	if (e.which == 13) {
		color = htmlColor.value;
		colorPreview.style.backgroundColor = "#" + color;
		updatePckrs();
	}
});

function addColorBtn(_color) {
	if ( colors.indexOf(_color) == -1 ) {
		colors.push( _color );
		var colorBtn = document.createElement('button');
		colorBtn.innerHTML = _color;
		colorBtn.style.background = "#"+_color;
		colorBtn.onclick = function() {
			color = this.innerHTML;
			colorPreview.style.backgroundColor = "#" + _color;
			updatePckrs();
		}
		document.getElementById('colorways').appendChild( colorBtn );
	}
}

/* change width */
var widthInput = document.querySelector("#canvas-width");
widthInput.addEventListener("keyup", function(ev) {
	if (ev.which == 13) {
		w = widthInput.value;
		c.width = w;
	}
});
widthInput.addEventListener("blur", function(ev) {
	w = widthInput.value;
	c.width = w;
});
var heightInput = document.querySelector("#canvas-height");
heightInput.addEventListener("keyup", function(ev) {
	if (ev.which == 13) {
		h = heightInput.value;
		c.height = h;
	}
});
heightInput.addEventListener("blur", function(ev) {
	h = heightInput.value;
	c.height = h;
});

/* set background */
var bkgImage = document.querySelector("#bkg-img");
var bkgX = document.querySelector("#bkg-x");
var bkgY = document.querySelector("#bkg-y");
var bkgS = document.querySelector("#bkg-size");
var showBkg = true;
bkgImage.addEventListener("keyup", function(e) {
	if (e.which == 13) {
		bkg.src = bkgImage.value;
		bkg.onload = function() {
			bkgX.min = -bkg.width;
			bkgY.min = -bkg.height;
			bkgX.max = bkg.width;
			bkgY.max = bkg.height;
			bkgSize = bkg.width;
			bkgRatio = bkg.width/bkg.height;
			bkgS.min = bkg.width/10;
			bkgS.max = bkg.width*2;
			bkgS.value = bkg.width;
		}
	}
});

function toggleBkg() {
	showBkg = !showBkg;
}

bkgX.addEventListener("input", function() {
	bkgx = bkgX.value;
});

bkgY.addEventListener("input", function() {
	bkgy = bkgY.value;
});
bkgS.addEventListener("input", function() {
	bkgSize = bkgS.value;
});


/* DRAWING EVENTS */
/* outside of canvas */
function outSideLines(event) {
	if (event.toElement.id != "canvas") {
		if (drawOn) saveLines();
		drawOn = false;
		if (moves%2==1) {
			lines.splice(-1,1);
		}
		moves = 0;

		/* this add copy frames for table pointer events (which doens't work great...) */
		if (event.which == 3) {
			event.preventDefault();
			const elem = document.elementFromPoint(event.clientX, event.clientY);
			const frm = e.id.split("fr")[1];
			if (elem.classList.contains("frame")) {
				if (!elem.classList.contains("copy")){
		 			elem.classList.add("copy")
		 			copyFrames.push(Number(frm));
		 		}
		 		
			}
		} 
	}
}

// move on canvas
function drawUpdate(event) {
	if (performance.now() > mousetime + mousetimer) {
		mousetimer = performance.now();
		if (drawOn && (frames[currentFrame] == undefined || addlines)) 
			addLine(event.offsetX, event.offsetY);
	}
}

// pointer down
function drawStart(event) {
	if (event.which == 1) {
		drawOn = true;
		mousetimer = performance.now();	
	}
}

// pointer up
function drawEnd(event) {
	if (event.which == 1) drawOn = false;
	if (moves%2==1) {
		lines.splice(-1,1);
	}
	moves = 0;

	if (event.which == 3) {
		event.preventDefault();
		selecting = false;
	}
}

if (window.PointerEvent) {
	c.addEventListener('pointermove', function(ev) { drawUpdate(ev) });
	c.addEventListener('pointerdown', function(ev) { drawStart(ev) });
	c.addEventListener('pointerup', function(ev) { drawEnd(ev) });
} else {	
	c.addEventListener('mousemove', function(ev) { drawUpdate(ev) });
	c.addEventListener('mousedown', function(ev) { drawStart(ev) });
	c.addEventListener('mouseup', function(ev) { drawEnd(ev) });
}
document.addEventListener('mousemove', function(ev) { outSideLines(ev) });

addEventListener('contextmenu', function(event){
	event.preventDefault();
	selecting = true;
});

/* LINES */
function addLine(mx, my) {
	lines.push({
		s:  new Vector(event.offsetX, event.offsetY)
	});
	if (moves > 0) lines[lines.length - 2].e = new Vector(event.offsetX, event.offsetY);
	moves++;
}

function drawLines(lns, index, end, nr, dr, col, onion) {
	for (var h = index; h < end; h++) {
		var line = lns[h];
		if (line && line.e) {
			var v = new Vector(line.e.x, line.e.y);
			v.subtract(line.s);
			v.divide(nr);
			ctx.beginPath();
			ctx.moveTo( line.s.x + getRandom(-dr, dr), line.s.y + getRandom(-dr, dr) );
			for (var i = 0; i < nr; i++) {
				var p = new Vector(line.s.x + v.x * i, line.s.y + v.y * i);
				ctx.lineTo( p.x + v.x + getRandom(-dr, dr), p.y + v.y + getRandom(-dr, dr) );
			}
			if (onion) ctx.strokeStyle = col;
			else ctx.strokeStyle= "#"+col;
      		ctx.stroke();
		}
	}				
}

/*  DRAW  */
function draw() {
	if (performance.now() > lineInterval + timer) {
		timer = performance.now();
		if (playing && currentFrameCounter < frames.length) {
			currentFrameCounter += intervalRatio;
			currentFrame = Math.floor(currentFrameCounter);
		}
		if (playing && currentFrame >= frames.length) {
			currentFrame = currentFrameCounter = 0;
		}

		/* update the anim frame number */
		if (playing) 
			updateFrameNum();

		ctx.clearRect(0, 0, w, h);
		
		if (bkg.src && showBkg)
			ctx.drawImage(bkg, bkgx, bkgy, bkgSize, bkgSize/bkgRatio);

		/* draws saved frame */
		if (frames[currentFrame]) {
			for (var i = 0; i < frames[currentFrame].length; i++) {
				var fr = frames[currentFrame][i];
				var dr = drawings[fr.d];
				drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, dr.c);
			}
		}

		/* draws current lines */
		if (frames[currentFrame] == undefined || addlines) {
			drawLines(lines, 0, lines.length, numRange, diffRange, color);
		}

		/* draws onionskin */
		if (onionskin > 0) {
			for (var o = 1; o <= onionskin; o++){
				var framenumber = currentFrame - o;
				if (framenumber >= 0) {
					var ca = 1.1 - (o / onionskin); //number for color
					var cn = "rgba(105,150,255,"+ca+")";
					for (var i = 0; i < frames[framenumber].length; i++) {
						var fr = frames[framenumber][i];
						var dr = drawings[fr.d];
						drawLines(dr.l, fr.i, fr.e, dr.n, dr.r, cn, true);
					}
				}
			}
		}
	}
	window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);

const framesPanel = document.querySelector("#frames");
const plusFrame = document.querySelector(".plusframe"); /* plus frame is unsaved drawing frame */

/* updates the frame panel representation of frames, sets current frame, sets copy frames */
function updateFrames() {
	let framenum = document.getElementsByClassName("frame").length;
	/* this creates frames that don't already exist
	loop from the num of already made html frames to frames.length */
	if (frames.length > framenum) {
		for (let i = framenum; i < frames.length; i++) {
			const frmElem = document.createElement("div");
			frmElem.classList.add("frame");
			frmElem.id = "fr" + i;
			frmElem.textContent = i;
			/* 
			add drawing nums, do this later after figuring out lines/frames/drawings 
			frmElem.innerHTML = i + "<br>";
			for (let d = 0; d < frames[i].length; d++) {
				frmElem.innerHTML += frames[i][d].d;
			}
			*/
			/* click on frame, set the current frame */
			frmElem.onclick = function(ev) {
				ev.preventDefault();
				currentFrame = currentFrameCounter = i;
				updateFrameNum();
			};
			/* right click, add/remove from copy frames */
			frmElem.oncontextmenu = function(ev) {
				ev.preventDefault();
				if (!this.classList.toggle("copy")){
					copyFrames.splice(copyFrames.indexOf(i), 1);
				} else {
					this.classList.add("copy");
					copyFrames.push(i);
				}
			};
			framesPanel.insertBefore(frmElem, plusFrame);
		}
	} else {
		/* if there are same number of less then frames than frame divs */
		/* this seems to only happen when deleting the current frame so i'm confused.... 
		delete frame should always be the current frame, is there another way to delete frames */
		for (let i = framenum - 1; i > frames.length; i--){
			/* remove html frame, make the plus frame the current frame */
			let removeFrame = document.getElementById( "fr" + i);
			/* check if deleted frame is the current frame */
			if (removeFrame.classList.contains("current")) plusFrame.classList.add("current");
			removeFrame.remove();
		}
	}
	updateFrameNum();
}

const frameDisplay = document.getElementById("frame");
function updateFrameNum() {
  	frameDisplay.textContent = currentFrame;
  	const currentElem = document.querySelector('.current');
  	currentElem.classList.remove("current");
  	const newElem = document.querySelector('#fr'+currentFrame);
  	if (newElem != null) newElem.classList.add("current");
  	else plusFrame.classList.add("current");
};

/* buttons and events */
function playToggle() {
	if (playing) 
		playing = false;
	else {
		saveLines();
		playing = true;
	}
	updateFrameNum();
}

function saveLines() {
	if ((frames[currentFrame] == undefined || addlines) && lines.length > 0  ) {
		if (frames[currentFrame] == undefined) frames[currentFrame] = [];
		
		// this should get rid of any lines with only s vector but doesn't?
		if (lines[lines.length - 1].e == undefined) lines.pop();
		
		frames[currentFrame].push({
			d:drawings.length, 
			i:0, 
			e:lines.length
		});
		drawings.push({
			l: lines,
			c: color,
			n: numRange,
			r: diffRange
		});
		addColorBtn(color);
	}	
	if (addlines) {
		addlines = false;
		$('#add-frame').removeClass("sel");
	}
	lines = [];

	if (saveStates.length == numSaveStates) {
		for (var i = 0; i < saveStates.length - 1; i++) {
			saveStates[i].d = saveStates[i+1].d.slice(0);
			var effff = [];
			for (var h = 0; h < saveStates[i+1].f.length; h++) {
				effff.push( saveStates[i+1].f[h].slice(0) );
			}
			saveStates[i].f = effff;
		}
		saveStates.pop();
	}
	if (frames.length != saveStates[saveStates.length - 1].f.length || 
		drawings.length != saveStates[saveStates.length - 1].d.length) {
		var effff = [];
		for (var i = 0; i < frames.length; i++) {
			if (frames[i]) // temp in case frame is undefined
				effff.push( frames[i].slice(0) );
		}
		saveStates.push({
			d: drawings.slice(0),
			f: effff
		});
	}
}

function nextFrame() {
	drawOn = false;
	saveLines();
	if (currentFrame < frames.length) currentFrame++;
	updateFrames();
}

function prevFrame() {
	drawOn = false;
	saveLines();
	if (currentFrame > 0) currentFrame--;
	updateFrameNum();
}

function copyFrame(e) {
	// this is maybe to copy multiple frame but idk if it works
	if (e && e.shiftKey) {
		for (var i = 0; i < copyFrames.length; i++) {
			if (frames[currentFrame] == undefined) frames[currentFrame] = [];
			for (var h = 0; h < frames[copyFrames[i]].length; h++) {
				frames[currentFrame].push(frames[copyFrames[i]][h]);
			}
			saveLines();
			nextFrame();
		}
	} else {
		if (lines.length > 0)  saveLines();
		if (frames[currentFrame]) {
			copy = [];
			for (var i = 0; i < frames[currentFrame].length; i++) {
				// using extend to clone, replace with lodash?
				copy.push($.extend(true,{},frames[currentFrame][i]));
			}
		}
	}
}

// duplicating drawings to change offset (need to rewrite with drawing indexes)
function duplicate() {
	if (lines.length > 0) saveLines();
	if (frames[currentFrame]) {
		copy = [];
		const drawingIndexOffset = drawings.length - 1;
		for (let i = 0; i < frames[currentFrame].length; i++) {
			drawings.push( _.cloneDeep( drawings[ frames[currentFrame][i].d ] ) );
			copy.push( {
				d: drawings.length - 1,
				i: frames[currentFrame][i].i,
				e: frames[currentFrame][i].e
			} );
		}
	}
}

function clearCopyFrames() {
	copyFrames = [];
	var copyFrameElems = document.getElementsByClassName("copy");
	for (var i = copyFrameElems.length - 1; i >= 0; i--) {
		copyFrameElems[i].classList.remove("copy");
	}
}

function pasteFrame(e) {
	if (e && e.ctrlKey) {
		clearCopyFrames();
	} else if (copyFrames.length > 0) {
		for (var h = 0; h < copyFrames.length; h++) {
			for (var i = 0; i < copy.length; i++) {
				frames[copyFrames[h]].push($.extend(true,{},copy[i]));
			}
		}
		clearCopyFrames();
	} else {
		if (frames[currentFrame] == undefined) {
			if (lines.length > 0) saveLines();
			else frames[currentFrame] = [];
			for (var i = 0; i < copy.length; i++) {
				frames[currentFrame].push($.extend(true,{},copy[i]));
			}
		} else if (addlines) {
			for (var i = 0; i < copy.length; i++) {
				frames[currentFrame].push($.extend(true,{},copy[i]));
			}
			addlines = false;
			$('#add-frame').removeClass("sel");
		}
	}
}

function clearFrame() {
	if (frames[currentFrame]) 
		frames[currentFrame] = undefined;
	lines = [];
}

function deleteFrame() {
	var ftemp = currentFrame;
	if (currentFrame > 0) prevFrame();
	if (frames[ftemp] && frames.length > 0) frames.splice(ftemp, 1);
	else if (frame[ftemp]) clearFrame();
	else lines = [];
	updateFrames();
}

function addToFrame() {
	saveLines();
	if (frames[currentFrame]) 
		addlines = true;
}
function cutLastLine(e) {
	// get rid of current lines or last add drawing in frame
	if (e && e.shiftKey && frames[currentFrame]) {
		saveLines();
		frames[currentFrame].pop(); // pop last drawing
	}
	else if (lines.length > 0) {
		
		lines.pop();
	}
	if (e && e.ctrlKey) {
		if (saveStates.length > 1) {
			saveStates.pop();
			frames = saveStates[saveStates.length - 1].f.slice();
			drawings = saveStates[saveStates.length - 1].d.slice();			
		}
	}
	//cutting already drawn line?? maybe later
	//else if (frames[currentFrame].length > 0) frames[currentFrame].pop();
}

function insertFrame() {
	saveLines();
	frames.insert(currentFrame, []);
	updateFrames();
}

function addMultipleCopies() {
	var n = prompt("Number of copies: ");
	if (Number(n)) {
		for (var i = 0; i < n; i++) {
			copyFrame();
			nextFrame();
			pasteFrame();
		}
	}
}

function explode(follow, over) {
	if (frames[currentFrame] == undefined) saveLines();
	var linenum = Number(prompt("Enter line num: "));
	if (linenum > 0) {
		var temp = frames[currentFrame].slice(0); 
		frames.splice(currentFrame, 1);
		for (var h = temp.length - 1; h >= 0; h--) {
			var tl = drawings[temp[h].d];
			if (over) {
				for (var i = 0; i < tl.l.length - 1; i += linenum) {
					if (!frames[currentFrame]) frames[currentFrame] = [];
					else addToFrame();
					if (follow) {
						frames[currentFrame].push({
							d: temp[h].d,
							i: i,
							e: i + linenum
						});
					} else {
						frames[currentFrame].push({
							d: temp[h].d,
							i: 0,
							e: i + linenum
						});
					}
					currentFrame++;
				}
			} else {
				for (var i = tl.l.length - 1 - linenum; i >= 0; i -= linenum) {
					insertFrame();
					if (!frames[currentFrame]) frames[currentFrame] = [];
					if (follow) {
						frames[currentFrame].push({
							d: temp[h].d,
							i: i,
							e: i + linenum
						});
					} else {
						for (var j = 0; j < h; j++) {
							frames[currentFrame].push(temp[j]);
						}
						frames[currentFrame].push({
							d: temp[h].d,
							i: 0,
							e: i + linenum
						});
					}
				}
			}
		}
		updateFrames();
	}
}

$('#onion-skin').on('change', function() {
	onionskin = this.value;
	this.blur();
});
$('#play').on('click', function() {
	playing = true;
});
$('#stop').on('click', function() {
	playing = false;
	updateFrameNum();
});


$('#insert-frame').on('click', insertFrame);
$('#delete-frame').on('click', deleteFrame);
$('#clear-frame').on('click', clearFrame);
$('#add-frame').on('click', addToFrame);
$('#next-frame').on('click', nextFrame);
$('.plusframe').on('click', function() {
	currentFrame = frames.length;
	updateFrameNum();
});
$('#prev-frame').on('click', prevFrame);
$('#copy').on('click', function(e) {
	copyFrame(e);
});
$('#paste').on('click', pasteFrame);
$('#cut-line').on('click', cutLastLine);
$('#explode').on('click', function() {
	explode(false, false);
});
$('#follow').on('click', function() {
	explode(true, false);
});
$('#explode-over').on('click', function() {
	explode(false, true);
});
$('#follow-over').on('click', function() {
	explode(true, true);
});

function screenCapture() {
	var cap = c.toDataURL("image/png").replace("image/png", "image/octet-stream");
	window.location.href = cap;
}

function keyDown(e) {
	if (document.activeElement.nodeName != "INPUT") {
		if (keys[e.which] == "e") nextFrame();
		if (keys[e.which] == "w") prevFrame();
		if (keys[e.which] == "c") copyFrame(e);
		if (keys[e.which] == "v") pasteFrame(e);
		if (keys[e.which] == "x") clearFrame();
		if (keys[e.which] == "r") addToFrame();
		if (keys[e.which] == "z") cutLastLine(e);
		if (keys[e.which] == "s") saveFramesToFile();
		if (keys[e.which] == "o") loadFramesFromFile();
		if (keys[e.which] == "i") insertFrame();
		if (keys[e.which] == "d") deleteFrame();
		if (keys[e.which] == "f") fitCanvasToDrawing();
		if (keys[e.which] == "space") {
			e.preventDefault();
			playToggle();
		}
		if (keys[e.which] == "m") addMultipleCopies();
		if (keys[e.which] == "b") toggleBkg();
		if (keys[e.which] == "k") screenCapture();
		if (keys[e.which] == "g") duplicate();
	}
}
document.addEventListener("keydown", keyDown, false);

$('.panel-toggle').on('click', function() {
	var parent = $(this).parent();
	if (parent.outerHeight() == 25) {
		parent.css({height:'auto'});
		this.innerHTML = "^";
	} else {
		parent.css({height: 25});
		this.innerHTML = "v";
	}
});


if (window.File && window.FileReader && window.FileList && window.Blob) {
	console.log("%c Save file enabled ", "color:lightgreen;background:black;");
}

$(window).on('beforeunload', function() {
	return 'Did you save dumbhole?';
});

// offset by vector

function offsetDrawing(offset) {
	for (let i = 0; i < frames[currentFrame].length; i++) {
		var d = drawings[frames[currentFrame][i].d];
		if (d != "x"){
			for (let j = 0; j < d.l.length; j++) {
				if (d.l[j].e && d.l[j].s) {
					d.l[j].e.y += offset.y;
					d.l[j].s.y += offset.y;
					d.l[j].e.x += offset.x;
					d.l[j].s.x += offset.x;
				}	
			}
		}
	}
}

function fitCanvasToDrawing() {
	saveLines();
	
	var tolerance = 0;
	var minx = 10000;
	var maxx = 0;
	var miny = 10000;
	var maxy = 0;

	for (var i = 0; i < drawings.length; i++) {
		if (drawings[i] != "x"){
			for (var j = 0; j < drawings[i].l.length; j++) {
				if (drawings[i].l[j].e && drawings[i].l[j].s) {

					tolerance = Math.max( tolerance, drawings[i].r * 4 );

					minx = Math.min( minx, drawings[i].l[j].e.x );
					miny = Math.min( miny, drawings[i].l[j].e.y );
					minx = Math.min( minx, drawings[i].l[j].s.x );
					miny = Math.min( miny, drawings[i].l[j].s.y );

					maxx = Math.max( maxx, drawings[i].l[j].e.x );
					maxy = Math.max( maxy, drawings[i].l[j].e.y );
					maxx = Math.max( maxx, drawings[i].l[j].s.x );
					maxy = Math.max( maxy, drawings[i].l[j].s.y );

				}	
			}
		}
	}

	c.width = w = (maxx - minx) + tolerance * 2;
	c.height = h = (maxy - miny) + tolerance * 2;

	for (var i = 0; i < drawings.length; i++) {
		if (drawings[i] != "x"){
			for (var j = 0; j < drawings[i].l.length; j++) {
				if (drawings[i].l[j].e && drawings[i].l[j].s) {
					drawings[i].l[j].e.x -= minx - tolerance;
					drawings[i].l[j].e.y -= miny - tolerance;
					drawings[i].l[j].s.x -= minx - tolerance;
					drawings[i].l[j].s.y -= miny - tolerance;
				}	
			}
		}
	}
}

function saveFramesToFile() {
	saveLines();
	var json = {};
	var end = frames.length * ( 1000 / Number(fps) );
	if (end > 1000) Math.ceil( json.end = end + 1000 );
	else json.end = 1000;
	json.w = w;
	json.h = h;
	json.fps = Number( fps );
	json.f = frames;
	json.d = [];
	var drawingsIndexes = [];
	for (var i = 0; i < frames.length; i++) {
		for (var j = 0; j < frames[i].length; j++) {
			if ( drawingsIndexes.indexOf(frames[i][j].d) == -1 ) 
				drawingsIndexes.push( frames[i][j].d );
		}
	}
	for (var i = 0; i < drawings.length; i++) {
		if ( drawingsIndexes.indexOf(i) != -1 ) 
			json.d.push( drawings[i] );
		else json.d.push( 'x' );
	}
	json.w = w;
	json.h = h;
	json.fps = Number( fps );
	var jsonfile = JSON.stringify(json);
	var filename = prompt("Name this file:");
	if (filename) {
		var blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
		saveAs(blob, filename+".json");
	}
}
$('#save').on('click', saveFramesToFile);

function loadFramesFromFile() {
	currentFrame = currentFrameCounter = 0;
	let filename = prompt("Open file:");
	title.textContent =  filename;
	$.getJSON(filename, function(data) {
		frames =  data.f;
		drawings = data.d;
		for (var i = 0; i < drawings.length; i++) if (drawings[i] != 'x') addColorBtn( drawings[i].c );
		w = data.w;
		h = data.h;
		fps = data.fps;
		$('#fps').val(fps);
		intervalRatio = lineInterval / (1000 / fps);
		c.width = w;
		c.height = h;
		updateFrames();
	}).error(function(error) {
        console.error("Loading error:", error.statusText, error);
    });
}
$('#open').on('click', loadFramesFromFile);