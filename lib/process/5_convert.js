/* 
	convert 2.4 to 2.5 
	changes
		f { s , e } -> f [0, 1]
		t [{prop, sf, ef, sv, ev },] -> t [ [0,1,2,3,4] ]
*/

const _ = require('lodash');
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

console.log('processing', file);

if (inn.bg) out.bg = inn.bg.includes('#') ? inn.bg : '#' + inn.bg; // why even saving bg color?

const tweenPropSubs = {
	'e': 'endIndex',
	's': 'startIndex',
};

out.l = _.cloneDeep(inn.l).map(layer => {
	const f = layer.f;
	const t = layer.t || [];
	if (!Array.isArray(layer.f)) layer.f = [f.s, f.e];
	if (layer.t) {
		const tweens = t.map(tween => {
			return !Array.isArray(tween) ?
				[tweenPropSubs[tween.prop], tween.sf, tween.ef, tween.sv, tween.ev] :
				tween;
		});
		layer.t = tweens;
		if (layer.t.length === 0) delete layer.t;
	}
	return layer;
});

out.s = {};
const states = _.cloneDeep(inn.s);
for (const state in states) {
	out.s[state] = [states[state].start, states[state].end];
}

out.d = _.cloneDeep(inn.d);

if (!fs.existsSync('bkup')) {
	fs.mkdirSync('bkup');
}

fs.writeFileSync('bkup/' + file, JSON.stringify(inn));
fs.writeFileSync(file, JSON.stringify(out));