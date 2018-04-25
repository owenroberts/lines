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

const drawings = [];
for (let i = 0; i < in_json.d.length; i++) {
	const dr = in_json.d[i].l;
	drawings[i] = [];
	for (let h = 0; h < dr.length; h++) {
		const p = dr[h];
		if (p.s && p.e) {
			if (h < dr.length - 1) {
				const np = dr[h + 1];
				if (p.e.x == np.s.x && p.e.y == np.s.y) {
					drawings[i].push({
						x: p.s.x,
						y: p.s.y
					});
				} else {
					drawings[i].push({
						x: p.s.x,
						y: p.s.y
					});
					drawings[i].push({
						x: p.e.x,
						y: p.e.y
					});
					drawings[i].push("end");
				}
			} else {
				drawings[i].push({
					x: p.e.x,
					y: p.e.y
				});
			}
		}
	}
}

const frames = [];
for (let i = 0; i < in_json.f.length; i++) {
	const fr = in_json.f[i];
	frames[i] = [];
	for (let h = 0; h < fr.length; h++) {
		const layer = fr[h];
		frames[i][h] = {};
		frames[i][h].d = fr[h].d;
		frames[i][h].s = fr[h].i;
		frames[i][h].e = drawings[fr[h].d].length,
		frames[i][h].x = 0;
		frames[i][h].y = 0;
		frames[i][h].c = in_json.d[fr[h].d].c;
		frames[i][h].n = in_json.d[fr[h].d].n;
		frames[i][h].r = in_json.d[fr[h].d].r;
	}
}


out_json.f = frames;
out_json.d = drawings;

// if (!fs.existsSync('bkup')){
// 	fs.mkdirSync('bkup');
// }
//fs.writeFileSync('bkup/' + f, JSON.stringify(in_json));
fs.writeFileSync("_" + f, JSON.stringify(out_json));

// still fucked up adding null points