/* convert 2.2 or 2.3 to 2.4 */

const fs = require('fs');
const file = process.argv[2];
const data = fs.readFileSync(file);
const inn = JSON.parse(data);
const out = {
	v: "2.4",
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

if (inn.v == '2.2') {
	/* get first frame, explode status for each layer */
	out.l = [];
	for (let i = 0; i < inn.l.length; i++) {
		out.l[i] = { ...inn.l[i] };
		delete out.l[i].s;
		delete out.l[i].e;
		out.l[i].f = {};
	}

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
			layer.a = [];
			const a = {};
			const b = {};
			if (prev[frame.l]) {
				if (frame.e != undefined && prev[frame.l].e != undefined) {
				    if (prev[frame.l].e < frame.e) {
				    	a.prop = 'e';
						a.sf = layer.f.s;
						a.ef = layer.f.e;
						a.sv = 0;
						a.ev = inn.d[layer.d].length
				    }
				}
				if (frame.s != undefined && prev[frame.l].s != undefined ) {
					if (prev[frame.l].s < frame.s) {
						if (a.prop == 'e') {
							if (b.prop) {
								b.ef = layer.f.e;
							} else {
								b.prop = 's';
								b.sf = i;
								b.ef = layer.f.e;
								b.sv = 0;
								b.ev = inn.d[layer.d].length;
							}
						} else {
							a.prop = 's';
							a.sf = layer.f.s;
							a.ef = layer.f.e;
							a.sv = 0;
							a.ev = inn.d[layer.d].length
						}
					}
				}
			}
			if (a.prop) layer.a.push(a);
			if (b.prop) layer.b.push(b);
			prev[frame.l] = { ...frame };
		}
	}
} else {
	out.l = inn.l;
	/* conver explode anims etc to layer anims */
	for (let i = 0; i < out.l.length; i++) {
		const layer = out.l[i];
		layer.a = [];
		console.log(layer);
		if (layer.draw != 'None') {
			switch(out.l.draw) {
				case 'Explode':
					layer.a.push({
						prop: 'e',
						sf: layer.f.s,
						ef: layer.f.e,
						sv: 0,
						ev: inn.d[layer.d].length
					});
				break;
				case 'Reverse':
					layer.a.push({
						prop: 's',
						sf: layer.f.s,
						ef: layer.f.e,
						sv: 0,
						ev: inn.d[layer.d].length
					});
				break;
				case 'ExRev':
					const mid = Math.floor((layer.f.e - layer.f.s) / 2);
					layer.a.push({
						prop: 'e',
						sf: layer.f.s,
						ef: layer.f.e + mid,
						sv: 0,
						ev: inn.d[layer.d].length
					});
					layer.a.push({
						prop: 's',
						sf: layer.f.s + mid,
						ef: layer.f.e,
						sv: 0,
						ev: inn.d[layer.d].length
					});
				break;
			}	
		}
		
	}
}



if (inn.v == '2.2') {
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
} else {
	out.d = inn.d;
}



if (!fs.existsSync('bkup')) {
    fs.mkdirSync('bkup');
}
fs.writeFileSync('bkup/' + file, JSON.stringify(inn));

if (inn.v == '2.3') {
	for (let i = 0; i < out.l.length; i++) {
		const layer = out.l[i];
		delete layer.draw;
	}
}

fs.writeFileSync(file, JSON.stringify(out));