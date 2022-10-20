/*
	some of this should be in ui now
*/

function FilesIO(lns, params) {

	let saveSettingsOnUnload = params.save || false; // use this ??
	let saveFilesEnabled = false;
	let fileName = undefined;

	// -- here


	function saveFile(single, callback) {

		lns.draw.reset();
		lns.ui.play.checkEnd();
		
		lns.anim.drawings.pop();
		lns.anim.layers.pop();

		self.fileName = lns.ui.faces.title.value || prompt("Name this file:");

		if (params.fit && confirm("Fit canvas?"))
			lns.canvas.fitCanvasToDrawing();

		const json = {
			v: "2.5",
			w: +lns.canvas.width,
			h: +lns.canvas.height,
			fps: +lns.anim.fps,
			mc: [...new Set(lns.anim.layers.map(layer => layer.color))].length > 1,
		};
		if (params.bg) json.bg = lns.canvas.bgColor;

		if (single) {
			json.l = _.cloneDeep(
				lns.anim.layers
					.filter(layer => layer.isInFrame(lns.anim.currentFrame))
				);
			json.l = json.l.map(layer => {
					layer.startFrame = 0;
					layer.endFrame = 0;
					return layer.getSaveProps();
				});
		} else {
			json.l = lns.anim.layers.map(layer => { return layer.getSaveProps() });
		}

		const drawingIndexes = new Set(json.l.map(layer => layer.d));

		json.d = [];
		for (let i = 0; i < lns.anim.drawings.length; i++) {
			json.d[i] = drawingIndexes.has(i) ?
				lns.anim.drawings[i].points.map(point => {
					if (point === 'end') return 0;
					else if (point === 'add') return 1;
					else return [Math.round(point[0]), Math.round(point[1])];
				}) 
				: null;
		}

		if (lns.ui.timeline.groups.length > 0) json.g = [...lns.ui.timeline.groups];

		if (Object.keys(lns.anim.states).length > 1) {
			json.s = {};
			for (const state in lns.anim.states) {
				if (state != 'default') {
					json.s[state] = [lns.anim.states[state].start, lns.anim.states[state].end];
				}
			}
		}

		const jsonfile = JSON.stringify(json);
		if (self.fileName) {
			const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
			saveAs(blob, `${self.fileName}${single ? '-' + lns.anim.frame : ''}.json`);
			setTimeout(callback, 500);
			lns.ui.faces.title.value = self.fileName;
		}
	} /* s key - shift-s for single */

	function saveFramesToFiles() {
		let i = 0;
		function saveFrame() {
			if (i <= lns.anim.endFrame) {
				lns.anim.frame = i;
				self.saveFile(true, () => {
					i++;
					saveFrame();
				});
			}
		}
		saveFrame();
	}

	/* loads from src url */
	function loadFile(fileName) {
		self.fileName = fileName;
		if (self.fileName) {
			if (self.fileName.slice(self.fileName.length - 5) !== '.json')  {
				self.fileName += '.json';
			}
			fetch(self.fileName)
				.then(response => { return response.json() })
				.then(data => { 
					self.loadJSON(data, fileName.split('/').pop()); 
				})
				.catch(error => {
					// alert('File not found: ' + error.message);
					console.error(error);
				});
		}
	}

	function loadJSON(data, fileName) {
		lns.anim = new Lines(lns.canvas.ctx, lns.render.dps, true);
		lns.anim.loadData(data, function() {
			lns.canvas.setWidth(data.w);
			lns.canvas.setHeight(data.h);
			lns.ui.faces.fps.update(data.fps);
			if (data.bg) lns.canvas.setBGColor(data.bg);
			if (data.g) lns.ui.timeline.groups = [...data.g];
			lns.draw.reset(); 
		});

		lns.ui.faces.title.value = fileName;
		lns.ui.faces.fps.value = data.fps;
		document.title = fileName + ' ~ animate';
		lns.ui.faces.width.value = data.w;
		lns.ui.faces.height.value = data.h;
		lns.anim.layers.forEach(layer => {
			if (layer) {
				lns.ui.faces.color.addColor(layer.color);
				lns.ui.faces.color.value = layer.color;
			}
		});
		if (data.bg) lns.ui.faces.bgColor.value = data.bg;
		lns.ui.update();
	}
	
	function reOpenFile() {
		self.saveFile({}, function(fileName) {
			location.href += `?src=/${ prompt("Enter location:") }/${ fileName }.json`;
		});
	} /* shift o */

	
	function openFile() {
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.click();
		openFile.onchange = function() {
			self.readFile(openFile.files);
		};
	} /* o key */

	function readFile(files, callback) {
		for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					self.fileName = f.name.split('.')[0];
					self.loadJSON(JSON.parse(e.target.result), self.fileName);
				};
			})(f);
			reader.readAsText(f);
		}
	}

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
