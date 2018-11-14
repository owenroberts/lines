/*
	round points in drawing
*/

const fs = require('fs');
const path = require('path');
const f = process.argv[2]; // file to convert
let in_data = fs.readFileSync(f);
let json = JSON.parse(in_data);

const d = `${path.dirname(f)}/bkup`;
const n = path.basename(f);

/* save backup */
if (!fs.existsSync(d)){
	fs.mkdirSync(d);
}
fs.writeFileSync(`${d}/${n}`, in_data);

for (let i = 0; i < json.d.length; i++) {
	const dr = json.d[i];
	if (dr) { // some drawings are null
		for (let j = 0; j < dr.length; j++) {
			const v = dr[j];
			v.x = Math.floor(v.x);
			v.y = Math.floor(v.y);
		}
	}
}

fs.writeFileSync(f, JSON.stringify(json));

/*
	bash loop
	for f in assets/sundays/*.json; do node lines/lib/rounder.js "$f"; done
*/