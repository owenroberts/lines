/*
	convert tweens to keyframes
*/

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const data = fs.readFileSync(filePath);
const json = JSON.parse(data);

const version = json.version ?? json.v;
if (version !== '2.7') {
	console.log("prob wont work prev v2.7");
	return;
}

const ext = path.extname(filePath);
const baseName = path.basename(filePath);
const dirName = path.dirname(filePath);
const backupDir = path.join(dirName, 'bkup');
const copyFilePath = path.join(backupDir, baseName);

if (!fs.existsSync(backupDir)) {
	fs.mkdirSync(backupDir);
}

fs.copyFile(filePath, copyFilePath, (err) => {
	if (err)  console.error('Error copying the file:', err);
	else console.log(`File copied successfully to: ${copyFilePath}`);
});

for (let i = 0; i < json.layers.length; i++) {
	const layer = json.layers[i];
	if (!layer.t) continue;
	json.layers[i].k = [];

	for (let j = 0; j < layer.t.length; j++) {
		const tween = layer.t[j];
		const keyframe = {
			prop: tween[0],
			frames: [
				[tween[1], tween[3]],
				[tween[2], tween[4]],
			]
		};
		json.layers[i].k.push(keyframe);
	}
	delete json.layers[i].t;
}

console.log(json.layers);

console.log('write file start');
fs.writeFileSync(filePath, JSON.stringify(json));
console.log('write file end');
