/* convert a to t - anim to tween */
const fs = require('fs');
const _ = require('lodash');
const file = process.argv[2];
const data = fs.readFileSync(file);
const inn = JSON.parse(data);
const out = _.cloneDeep(inn);

const layers = out.l;
layers.forEach(layer => {
	if (layer.a) {
		const t = _.cloneDeep(layer.a);
		delete layer.a;
		layer.t = t;
	}
});


if (!fs.existsSync('bkup')) {
	fs.mkdirSync('bkup');
}
fs.writeFileSync('bkup/' + file, JSON.stringify(inn));
fs.writeFileSync(file, JSON.stringify(out));