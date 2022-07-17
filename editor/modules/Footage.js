/*
	module for adding files and organizing footage
*/

function Footage(app) {
	const self = this;

	let askToSetFootage = true;
	const animations = {};
	this.filePaths = [];

	function loadJSON(data, fileName, filePath, fromFile) {
		// app.render.dps
		animations[fileName] = new Lines(app.canvas.ctx, 30, true);
		animations[fileName].loadData(data, () => {
			if (fromFile || (askToSetFootage && confirm("Set project settings?"))) {
				askToSetFootage = false;
				app.ui.faces.width.update(data.w);
				app.ui.faces.height.update(data.h);
				// app.ui.faces.fps.update(data.fps); -- global or not???
				// if (data.bg) app.ui.faces.bgColor.update(data.bg);				
			}
		});

		const btn = new UIButton({
			text: fileName,
			callback: () => {
				const clip = new Clip({
					filePath: filePath,
					name: fileName, 
					animation: animations[fileName],
					startFrame: app.renderer.frame
				});
				app.timeline.addClip(clip);
			}
		});
		self.panel.footageRow.append(btn);
		self.filePaths.push(filePath);
	}

	function readFile(files, directoryPath) {
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

	this.load = function(footage, fromFile, callback) {
		footage.forEach(filePath => {
			const fileName = filePath.split('/').pop().replace('.json', '');
			fetch(filePath)
				.then(response => response.json())
				.then(data => {
					loadJSON(data, fileName, filePath, fromFile);
					if (callback) callback();
				})
				.catch(err => { console.error('err', err.message ); });
		});
	};

	this.openFile = function() {
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.multiple = true;
		openFile.click();
		openFile.onchange = function() {
			let directoryPath = prompt('Directory?', '/drawings/');
			readFile(openFile.files, directoryPath);
		};
	};

	this.get = function(name) {
		return animations[name];
	};
}