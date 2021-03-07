function Files(params) {
	const self = this;

	this.saveFilesEnabled = false;
	this.saveSettingsOnUnload = params.save || false;
	this.fileName = undefined;

	/* s key - shift-s for single */
	this.saveFile = function(single, callback) {

		lns.draw.reset();
		lns.ui.play.checkEnd();
		
		lns.anim.drawings.pop();
		lns.anim.layers.pop();

		self.fileName = lns.ui.faces.title.value || prompt("Name this file:");

		if (params.fit && confirm("Fit canvas?"))
			lns.canvas.fitCanvasToDrawing();

		const json = {};
		json.v = "2.4";
		json.w = +lns.canvas.width;
		json.h = +lns.canvas.height;
		json.fps = +lns.anim.fps;
		if (params.bg) json.bg = lns.canvas.bgColor;
		let colors = lns.anim.layers.map(layer => layer.c);
		colors = [...new Set(colors)];
		json.mc = colors.length > 1 ? true : false;

		if (single) {
			json.l = lns.anim.layers
				.filter(layer => layer.isInFrame(lns.anim.currentFrame))
				.map(layer => {
					layer.startFrame = 0;
					layer.endFrame = 0;
					return layer.saveProps;
				});
		} else {
			json.l = lns.anim.layers.map(layer => { return layer.saveProps });
		}

		/* search frames for layers and drawings used */
		// functional approach here ??

		const drawingIndexes = [];
		for (let i = 0; i < json.l.length; i++) {
			const drawingIndex = json.l[i].drawingIndex;
			if (!drawingIndexes.includes(drawingIndex))
				drawingIndexes.push(drawingIndex);
		}

		json.d = [];
		for (let i = 0; i < drawingIndexes.length; i++) {
			const index = drawingIndexes[i];
			const drawing = lns.anim.drawings[index];
			const d = [];
			for (let j = 0; j < drawing.length; j++) {
				const point = drawing.get(j);
				if (point == 'end') d.push(0);
				else d.push([point.x, point.y]);
			}
			json.d[index] = d;
		}

		/* don't save default state */
		if (Object.keys(lns.anim.states).length > 1) {
			json.s = _.cloneDeep(lns.anim.states);
			delete json.s.default;
		}

		const jsonfile = JSON.stringify(json);

		if (self.fileName) {
			const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
			saveAs(blob, `${self.fileName}.json`);
			lns.ui.faces.title.value = self.fileName;
		}
	};

	/* loads from src url */
	this.loadFile = function(fileName, callback) {
		self.fileName = fileName;
		if (self.fileName) {
			if (self.fileName.slice(self.fileName.length - 5) != '.json') 
				self.fileName += '.json';
			fetch(self.fileName)
				.then(response => { return response.json() })
				.then(data => { self.loadJSON(data, callback); })
				.catch(error => {
					// alert('File not found: ' + error.message);
					console.error(error);
				});
		}
	};

	this.loadJSON = function(data, callback) {

		lns.anim = new LnsAnim(lns.canvas.ctx, lns.render.dps);
		lns.anim.loadData(data, function() {
			lns.canvas.setWidth(data.w);
			lns.canvas.setHeight(data.h);
			lns.ui.faces.fps.update(data.fps);
			if (data.bg) lns.canvas.setBGColor(data.bg);
			lns.draw.reset(); 
			// if (callback) callback(data, params); // why?
			if (callback) callback(data);

		});
	};

	/* shift o */
	this.reOpenFile = function() {
		self.saveFile({}, function(fileName) {
			location.href += `?src=/${ prompt("Enter location:") }/${ fileName }.json`;
		});
	};

	/* o key */
	this.openFile = function() {
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.click();
		openFile.onchange = function() {
			self.readFile(openFile.files, lns.ui.updateFIO);
		};
	};

	this.readFile = function(files, callback) {
		for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
				self.fileName = f.name.split('.')[0];
				self.loadJSON(JSON.parse(e.target.result), callback);
			};
			})(f);
			reader.readAsText(f);
		}
	};

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		lns.canvas.canvas.addEventListener('dragover', dragOverHandler);
		lns.canvas.canvas.addEventListener('drop', dropHandler);
		// https://gist.github.com/andjosh/7867934
	}

	function dropHandler(ev) {
 		ev.preventDefault();
 		ev.stopPropagation();
 		self.readFile(ev.dataTransfer.files, lns.ui.updateFIO);
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}

	window.addEventListener("beforeunload", function(ev) {
		if (self.saveSettingsOnUnload) lns.ui.settings.saveSettings();
		if (params.reload) ev.returnValue = 'Did you save dumbhole?';
	});
}
