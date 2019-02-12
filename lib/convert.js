/*
	node tool to convert file formats from v1 to v2
*/

const fs = require('fs');
const f = process.argv[2]; // file to convert
let in_data = fs.readFileSync(f);
let in_json = JSON.parse(in_data);
let out_json = {};
out_json.v = "2.1";
out_json.w = in_json.w;
out_json.h = in_json.h;
out_json.fps = in_json.fps;
out_json.bg = in_json.bg || "ffffff";
out_json.mc = in_json.mix || in_json.mc || false;

/*
	get drawing data first 
	bc frame start and end nums will change
*/
const drawingMap = []; // map new drawing indexes s and e
const drawings = [];
for (let i = 0; i < in_json.d.length; i++) {
	if (in_json.d[i] && in_json.d[i] != 'x') {
		const dr = in_json.d[i].l;
		// test with 'x' drawing - won't it throw error?
		drawings[i] = []; // empty drawing for each drawing
		drawingMap[i] = {}; // empty dr map object 
		for (let j = 0; j < dr.length; j++) {
			const v = dr[j]; // get each segment
			if (v.s && v.e) {
				if (j < dr.length - 1) {
					const nv = dr[j + 1]; // get the next segment 
					/* if the segment end vector matches next segment start vector
						save the start vector */
					if (v.e.x == nv.s.x && v.e.y == nv.s.y) {
						drawings[i].push({
							x: v.s.x,
							y: v.s.y
						});
					} else {
						/* if not, then this is a new line segment
							save start and end bc they dont get saved anywhere else */
						drawings[i].push({
							x: v.s.x,
							y: v.s.y
						});
						drawings[i].push({
							x: v.e.x,
							y: v.e.y
						});
						/* add an "end" segment */
						drawings[i].push("end");
					}
				} else {
					/* this is the last segment, save the end vector */
					drawings[i].push({
						x: v.e.x,
						y: v.e.y
					});
					drawings[i].push("end"); /* add an "end" segment */
				}
			} else if (v.s && !v.e) {
				drawings[i].push("end"); /* end */
			} else {
				console.log('nothing recorded');
			}
			drawingMap[i][j] = drawings[i].length - 1;
		}
	}
}


const frames = [];
for (let i = 0; i < in_json.f.length; i++) {
	const fr = in_json.f[i];
	frames[i] = []; // each frames has an array of layers
	for (let j = 0; j < fr.length; j++) {
		
		const layer = fr[j]; // layers are drawings in each frame
		frames[i][j] = {};
		frames[i][j].d = layer.d;

		if (drawingMap[layer.d][layer.i] !== undefined) {
			frames[i][j].s = drawingMap[layer.d][layer.i];
		} else {
			frames[i][j].s = 0;
		}

		if (drawingMap[layer.d][layer.e] !== undefined) {
			frames[i][j].e = drawingMap[layer.d][layer.e];
		} else {
			frames[i][j].e = drawings[fr[j].d].length;
		}

		frames[i][j].x = 0; // old drawings dont' have x,y
		frames[i][j].y = 0;
		frames[i][j].w = 0; // old drawings dont' have w,v (wiggle, speed)
		frames[i][j].v = 0;
		frames[i][j].c = in_json.d[layer.d].c;
		frames[i][j].n = in_json.d[layer.d].n;
		frames[i][j].r = in_json.d[layer.d].r;
	}
}


out_json.f = frames;
out_json.d = drawings;

if (!fs.existsSync('bkup')){
	fs.mkdirSync('bkup');
}
fs.writeFileSync('bkup/' + f, JSON.stringify(in_json));
fs.writeFileSync(f, JSON.stringify(out_json));