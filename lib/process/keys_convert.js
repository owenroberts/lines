/*
	convert data abbrevations to keys
	v -> version
	w -> width
	h -> height
	mc -> isMultiColor
	mw -> isMultLineWidth
	bg -> bgColor
	d -> drawings
	l -> layers
	g -> groups
	s -> states
	st -> styles
	q -> sequences
	qi -> sequenceIndex
*/

const conMap = {
	v: "version",
	w: "width",
	h: "height",
	mc: "isMultiColor",
	mw: "isMultLineWidth",
	bg: "bgColor",
	d: "drawings",
	l: "layers",
	g: "groups",
	s: "states",
	st: "styles",
	q: "sequences",
	qi: "sequenceIndex",
};

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const data = fs.readFileSync(filePath);

const json = JSON.parse(data);

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

for (const k in conMap) {
	const newKey = conMap[k];
	json[newKey] = json[k];
	delete json[k];
}

console.log('write file start');
fs.writeFileSync(filePath, JSON.stringify(json));
console.log('write file end');