function Files(params) {
	const self = this;

	this.saveFilesEnabled = false;
	this.saveSettingsOnUnload = params.save || false;
	this.fileName = undefined;

	/* s key - shift-s for single */
	this.saveFile = function(title, single, callback) {
		lns.data.saveLines();

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

		/* save current frame */
		let layers = [];
		if (single) {
			for (let i = 0; i < lns.anim.layers.length; i++) {
				if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) {
					const layer = _.cloneDeep(lns.anim.layers[i]);
					layer.startFrame = 0;
					layer.endFrame = 0;
					layers.push(layer);;
				}
			}
		} else {
			layers = lns.anim.layers;
		}

		for (let i = 0; i < layers.length; i++) {
			layers[i].clean();
		}
		json.l = layers;

		/* search frames for layers and drawings used */
		const drawingIndexes = [];
		for (let i = 0; i < layers.length; i++) {
			const drawingIndex = layers[i].d;
			if (!drawingIndexes.includes(drawingIndex))
				drawingIndexes.push(drawingIndex);
		}

		json.d = [];
		for (let i = 0; i < drawingIndexes.length; i++) {
			const index = drawingIndexes[i];
			const drawing = lns.anim.drawings[index];
			const d = [];
			for (let j = 0; j < drawing.length; j++) {
				const point = drawing[j];
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
		const fileName = title || prompt("Name this file:");

		if (fileName) {
			const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
			saveAs(blob, `${fileName}.json`);
			if (callback) callback(fileName); /* to set values ... */
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
					alert('File not found: ' + error.message);
					console.error(error);
				});
		}
	};

	this.loadJSON = function(data, callback) {
		lns.anim.drawings = [];
		for (let i = 0; i < data.d.length; i++) {
			const drawing = data.d[i];
			const d = [];
			if (drawing) {
				for (let j = 0; j < drawing.length; j++) {
					const point = drawing[j];
					if (point) d.push({ x: point[0], y: point[1] });
					else d.push('end');
				}
			}
			lns.anim.drawings[i] = d;
		}

		lns.anim.layers = [];
		for (let i = 0; i < data.l.length; i++) {
			lns.anim.layers[i] = new Layer(data.l[i]);
			lns.draw.layer.c = lns.anim.layers[i].c;
			lns.ui.faces.c.addColor(lns.anim.layers[i].c); /* ui - loading func? */
		}

		if (data.s) lns.anim.states = data.s;
		if (lns.anim.states.default) lns.anim.states.default.end = lns.anim.endFrame;

		/* set interface values  */
		// console.log(lns.ui.states.panel);
		lns.ui.faces.stateSelector.setOptions(Object.keys(lns.anim.states));

		lns.canvas.setWidth(data.w);
		lns.canvas.setHeight(data.h);
		
		// lns.anim.fps = data.fps;
		lns.ui.faces.fps.update(data.fps);
		
		if (data.bg) lns.canvas.setBGColor(data.bg);
		lns.render.reset();

		if (callback) callback(data, params);
	};

	/* shift o */
	this.reOpenFile = function() {
		console.log(self.fileName);
		self.saveFile(undefined, undefined, function(fileName) {
			location.href += `?src=${ prompt("Enter location:") }/${ fileName }`;
		});
	};

	/* o key */
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
		const nav = document.getElementById('nav');
		nav.addEventListener('dragover', dragOverHandler);
		nav.addEventListener('drop', dropHandler);
		// https://gist.github.com/andjosh/7867934
	}

	function dropHandler(ev) {
 		ev.preventDefault();
 		ev.stopPropagation();
 		self.readFile(ev.dataTransfer.files, lns.ui.fio.update);
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}

	window.addEventListener("beforeunload", function(ev) {
		if (self.saveSettingsOnUnload) lns.ui.settings.saveSettings();
		if (params.reload) ev.returnValue = 'Did you save dumbhole?';
	});
}
