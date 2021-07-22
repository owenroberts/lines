/* convert 2.2 to 2.3 - layers - no frames */
const fs = require('fs');
const file = process.argv[2];
const data = fs.readFileSync(file);
const inn = JSON.parse(data);
const out = {
	v: "2.3",
	w: inn.w,
	h: inn.h,
	fps: inn.fps
};
if (inn.bg) {
	out.bg = inn.bg;
	if (!out.bg.includes('#'))
		out.bg = '#' + out.bg;
}
out.mc = inn.mc || false;

/* delete s,e from layers */
out.l = [];
for (let i = 0; i < inn.l.length; i++) {
	out.l[i] = { ...inn.l[i] };
	delete out.l[i].s;
	delete out.l[i].e;
	out.l[i].f = {};
	out.l[i].draw = 'None';
}

/* get first frame, explode status for each layer */
let newLayers = [];
let prev = {};
for (let i = 0; i < inn.f.length; i++) {
	const frames = inn.f[i];
	for (let j = 0; j < frames.length; j++) {
		const frame = frames[j];
		const layer = newLayers[frame.l] || out.l[frame.l];
		if (i <= layer.f.s || layer.f.s == undefined) layer.f.s = i;
		if (i >= layer.f.e || layer.f.e == undefined) layer.f.e = i;
		
		if (!layer.c.includes('#')) layer.c = '#' + layer.c;

		if (prev[frame.l]) {
			if (frame.e != undefined && prev[frame.l].e != undefined) {
			    if (prev[frame.l].e < frame.e) layer.draw = 'Explode';
			    if (prev[frame.l].e == frame.e) {

			    	/* if its not exploading then we need a new layer
			    		with draw None 
			    		cant insert layer
			    		need to add at the end */
			    	if (layer.draw != 'None') {
						const newLayer = { ...layer };
						newLayer.draw = 'None';
						newLayer.f = { s: i, e: i };
						newLayers[frame.l] = newLayer;
			    	}
			    	layer.f.e--;
			    }
			}
			if (frame.s != undefined && prev[frame.l].s != undefined ) {
				if (prev[frame.l].s < frame.s) {
					if (layer.draw != 'None') layer.draw = 'ExRev';
					else layer.draw = 'Reverse';
				}
			}
		}
		prev[frame.l] = { ...frame };
	}
}

for (let i = 0; i < newLayers.length; i++) {
	if (newLayers[i]) {
		out.l.push(newLayers[i]);
		console.log('add', newLayers[i].d, 'index', out.l.length);
	}
}

/* convert drawing points to arrays */
out.d = [];
for (let i = 0; i < inn.d.length; i++) {
	const drawing = inn.d[i];
	const d = [];
	if (drawing) {
		for (let j = 0; j < drawing.length; j++) {
			const point = drawing[j];
			if (point == "end") d.push(0);
			else d.push([point.x, point.y])
		}
		out.d[i] = d;
	}
}

if (!fs.existsSync('bkup')) {
    fs.mkdirSync('bkup');
}

fs.writeFileSync('bkup/' + file, JSON.stringify(inn));
fs.writeFileSync(file, JSON.stringify(out));
