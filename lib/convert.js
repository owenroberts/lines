/*
	node tool to convert file formats from v1 to v2
*/

const fs = require('fs');
const f = process.argv[2]; // file to convert
let in_data = fs.readFileSync(f);
let in_json = JSON.parse(in_data);
let out_json = {};
out_json.v = "2.0";
out_json.w = in_json.w;
out_json.h = in_json.h;
out_json.fps = in_json.fps;
out_json.bg = "ffffff";

/*
	get drawing data first bc frame start and end nums will change
*/
const drawings = [];
for (let i = 0; i < in_json.d.length; i++) {
	const dr = in_json.d[i].l;
	// test with 'x' drawing
	drawings[i] = []; // empty drawing for each drawing
	for (let h = 0; h < dr.length; h++) {
		const v = dr[h]; // get each segment
		if (v.s && v.e) { 
			if (h < dr.length - 1) {
				const nv = dr[h + 1]; // get the next segment 
				/* if the seggment end vector matches next segment start vector
					save the start vector */
				if (v.e.x == nv.s.x && v.e.y == nv.s.y) {
					drawings[i].push({
						x: v.s.x,
						y: v.s.y
					});
				} else {
					/* if not, then this is a new line segment
						save start and end bc they dont get saved anywhere else*/
					drawings[i].push({
						x: v.s.x,
						y: v.s.y
					});
					drawings[i].push({
						x: v.e.x,
						y: v.e.y
					});
					/* add and "end" segment */
					drawings[i].push("end");
				}
			} else {
				/* this is the last segment, save the end vector */
				drawings[i].push({
					x: v.e.x,
					y: v.e.y
				});
			}
		}
	}
}

/* now the frames */
const frames = [];
for (let i = 0; i < in_json.f.length; i++) {
	const fr = in_json.f[i];
	frames[i] = []; // each frames has an array of layers
	for (let h = 0; h < fr.length; h++) {
		const layer = fr[h]; // layers are drawings in each frame
		frames[i][h] = {};
		frames[i][h].d = fr[h].d;
		frames[i][h].s = fr[h].i;
		frames[i][h].e = drawings[fr[h].d].length, // end length may change
		frames[i][h].x = 0; // old drawings dont' have x,y
		frames[i][h].y = 0;
		frames[i][h].c = in_json.d[fr[h].d].c;
		frames[i][h].n = in_json.d[fr[h].d].n;
		frames[i][h].r = in_json.d[fr[h].d].r;
	}
}


out_json.f = frames;
out_json.d = drawings;

if (!fs.existsSync('bkup')){
	fs.mkdirSync('bkup');
}
fs.writeFileSync('bkup/' + f, JSON.stringify(in_json));
fs.writeFileSync(f, JSON.stringify(out_json));