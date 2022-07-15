/*
	module for adding files and organizing footage
*/

function Footage(app) {
	const self = this;

	let askToSetFootage = true;
	const animations = {};
	this.filePaths = [];

	function loadJSON(data, fileName, filePath) {
		// console.log(data, fileName);
		// app.render.dps
		animations[fileName] = new Lines(app.canvas.ctx, 30, true);
		animations[fileName].loadData(data, () => {
			if (askToSetFootage && confirm("Set project settings?")) {
				askToSetFootage = false;
				app.ui.faces.width.update(data.w);
				app.ui.faces.height.update(data.h);
				// app.ui.faces.fps.update(data.fps);
				// if (data.bg) app.ui.faces.bgColor.update(data.bg);				
			}
		});

		const btn = new UIButton({
			text: fileName,
			callback: () => {
				console.log(fileName, animations[fileName]);
			}
		});
		self.panel.footageRow.append(btn);
		self.filePaths.push(filePath);
	}

	function readFile(files) {
		for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					const filePath = directoryPath + f.name;
					const fileName = f.name.split('.')[0];
					loadJSON(JSON.parse(e.target.result), fileName, filePath);
				};
			})(f);
			reader.readAsText(f);
		}
	}

	this.load = function(footage) {
		footage.forEach(filePath => {
			const fileName = filePath.split('/').pop().replace('.json', '');
			fetch(filePath)
				.then(response => response.json())
				.then(data => loadJSON(data, fileName, filePath))
				.catch(err => { console.error('err', err.message ); });
		});
	};

	this.openFile = function() {
		let directoryPath = prompt('Directory?', '/drawings/');
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.multiple = true;
		openFile.click();
		openFile.onchange = function() {
			readFile(openFile.files);
		};
	};
}