/* 
	convert 2.4 to 2.5 
	changes
		f { s , e } -> f [0, 1]
		t [{prop, sf, ef, sv, ev },] -> t [ [0,1,2,3,4] ]
*/

const fs = require('fs');
const file = process.argv[2];
const data = fs.readFileSync(file);
const inn = JSON.parse(data);
const out = {
	v: "2.5",
	w: inn.w,
	h: inn.h,
	fps: inn.fps,
	mc: inn.mc || false,
};

if (inn.bg) out.bg = inn.bg; // why even saving bg color?

out.l = inn.l.map(layer => {
	const f = layer.f;
	const t = layer.t;
	layer.f = [f.s, f.e];
	layer.t = t.map(tween => {
		return [tween.prop, tween.sf, tween.ef, tween.sv, tween.ev]
	});
	return layer;
});

out.d = inn.d;

if (!fs.existsSync('bkup')) {
	fs.mkdirSync('bkup');
}

fs.writeFileSync('bkup/' + file, JSON.stringify(inn));
fs.writeFileSync(file, JSON.stringify(out));