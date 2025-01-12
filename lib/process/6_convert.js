/*
	conver 2.5 to 2.6
	change
	v 2.5 to 2.6
	save styles 
	save style index
*/

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const data = fs.readFileSync(filePath);

const inData = JSON.parse(data);
const outData = { v: '2.6' };

// copy simple properties
outData.title = inData.title;
outData.w = inData.w;
outData.h = inData.h;
outData.fps = inData.fps;
outData.mc = inData.mc;
outData.mw = inData.mw;
outData.bg = inData.bg;
outData.qi = inData.qi;

// clone drawings, groups, sequences
outData.q = structuredClone(inData.q);
outData.g = structuredClone(inData.g);
outData.d = structuredClone(inData.d);

// loop through layers
// get style and save it 
// compare each layer style to style index
const layers = [];
const styles = [];
const layerToStyleConversion = {
	c: "color",
	lw: "lineWidth",
	n: "segmentNum",
	r: "jiggleRange",
	w: "wiggleRange",
	v: "wiggleSpeed",
	ws: "wiggleSegments",
	b: "breaks",
	l: "linesInterval",
};

function saveStyle(inLayer) {
	const outStyle = {};
	for (const k in layerToStyleConversion) {
		const key = layerToStyleConversion[k];
		outStyle[key] = inLayer[k];
	}
	return outStyle;
}

function compareStyles(style, layer) {
	let isSameStyle = true;
	for (const k in layerToStyleConversion) {
		const key = layerToStyleConversion[k];
		if (style[key] !== layer[k]) {
			isSameStyle = false;
		}
	}
	return isSameStyle;
}

for (let i = 0; i < inData.l.length; i++) {
	const inLayer = inData.l[i];
	const outLayer = {};

	// copy props
    outLayer.d = inLayer.d;
    outLayer.g = inLayer.g;

    // clone arrays
    outLayer.f = structuredClone(inLayer.f);
    outLayer.t = structuredClone(inLayer.t);

    // first layer sets the first style
    if (styles.length === 0) {
		styles.push(saveStyle(inLayer));
		outLayer.s = 0;
		
	} else {

		// look for a similar style, if none exist, make new style
		let foundStyle = false;
		for (let i = 0; i < styles.length; i++) {
			if (compareStyles(styles[i], inLayer)) {
				outLayer.s = i;
				foundStyle = true;
			}
		}

		if (!foundStyle) {
			styles.push(saveStyle(inLayer));
			outLayer.s = styles.length - 1;;
		}

	}
	layers.push(outLayer);
}

outData.l = layers;
outData.st = styles;

const ext = path.extname(filePath);
const baseName = path.basename(filePath, ext);
const dirName = path.dirname(filePath);
const newFilePath = path.join(dirName, `${baseName}-n${ext}`);

fs.writeFileSync(newFilePath, JSON.stringify(outData));

