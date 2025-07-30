/*
	convert 2.6 to 2.7
	change fps to dpf
	node lines/lib/process/7_convert.js path/to/file.json
	turn this into a module?
*/

const fs = require('fs');
const path = require('path');

const filePath = process.argv[2];
const data = fs.readFileSync(filePath);

const json = JSON.parse(data);

if (json.v === '2.7') {
	console.log("Already v2.7");
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

json.v = '2.7';
json.dpf = Math.round(30 / json.fps);
delete json.fps;
console.log('write file start');
fs.writeFileSync(filePath, JSON.stringify(json));
console.log('write file end');
