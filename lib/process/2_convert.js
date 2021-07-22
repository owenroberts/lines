/* convert 2.1 to 2.2 - layers */
const fs = require('fs');
const f = process.argv[2]; // file to convert
const data = fs.readFileSync(f);
const inn = JSON.parse(data);
const out = {};
out.v = "2.2";
out.w = inn.w;
out.h = inn.h;
out.fps = inn.fps;

if (inn.bg) out.bg = inn.bg;
out.mc = inn.mc || false;

/* make layers from frames */
const layers = [];
const frames = [];
for (let i = 0; i < inn.f.length; i++) {
	const frame = inn.f[i];
	frames[i] = [];
	for (let j = 0; j < frame.length; j++) {
		const layer = frame[j];
		if (layers.filter(lay => lay.d == layer.d).length > 0) {
			// layer already exists with that drawing
			const prev = layers.filter(lay => lay.d == layer.d);
			const prevLayer = prev[prev.length - 1]; // get the last layer with that drawing
			const index = layers.indexOf(prevLayer);
			const frameLayer = { l: index }
			for (key in layer) {
				// for each value, if they're not the same, the new layer goes into the frame
				if (layer[key] != prevLayer[key]) {
					frameLayer[key] = layer[key];
				}
			}
			frames[i].push(frameLayer);
		} else {
			layers.push(layer);
			frames[i].push({l: layers.length - 1});
		}
	}
}

// update color values
for (let i = 0; i < layers.length; i++) {
	const layer = layers[i];
	if (!layer.c.includes('#')) layer.c = '#' + layer.c;
}

for (let i = 0; i < frames.length; i++) {
	const frame = frames[i];
	for (let j = 0; j < frame.length; j++) {
		const frameLayer = frame[j];
		if (frameLayer.c)
			if (!frameLayer.c.includes('#'))
				frameLayer.c = '#' + frameLayer.c;
	}
}


out.l = layers;
out.f = frames;
out.d = inn.d; // drawings should be the same!

if (!fs.existsSync('bkup')){
	fs.mkdirSync('bkup');
}
fs.writeFileSync('bkup/' + f, JSON.stringify(inn));
fs.writeFileSync(f, JSON.stringify(out));
