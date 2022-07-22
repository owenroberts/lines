/*
	module for adding files and organizing footage
*/

function Footage(app) {
	const self = this;

	let askToSetFootage = true;
	const animations = {};
	this.filePaths = [];

	function loadJSON(data, fileName, filePath, fromFile) {
		animations[fileName] = new Lines(app.canvas.ctx, 30, true);
		animations[fileName].loadData(data, () => {
			if (fromFile || (askToSetFootage && confirm("Set project settings?"))) {
				askToSetFootage = false;
				app.ui.faces.width.update(data.w);
				app.ui.faces.height.update(data.h);
				if (data.bg) app.ui.faces.bgColor.update(data.bg);
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

	this.load = function(footage, fromFile, callback) {
		let footageCount = 0;
		let totalFootage = footage.length;
		footage.forEach(filePath => {
			const fileName = filePath.split('/').pop().replace('.json', '');
			fetch(filePath)
				.then(response => response.json())
				.then(data => {
					loadJSON(data, fileName, filePath, fromFile);
					footageCount++;
					if (footageCount === totalFootage) {
						if (callback) callback();
					}
				})
				// .catch(err => { console.error('err', err.message ); });
		});
	};

	this.open = function(data, fileName, filePath) {
		loadJSON(data, fileName, filePath);
	};

	this.get = function(name) {
		return animations[name];
	};
}