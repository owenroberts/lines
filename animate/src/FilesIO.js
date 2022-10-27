/*
	some of this should be in ui now
*/

function FilesIO(lns, params) {

	let saveSettingsOnUnload = params.save || false; // use this ??
	let saveFilesEnabled = false;
	let fileName = undefined;

	function getSaveData(isSingleFrame) {

		const json = {
			v: "2.5",
			w: +lns.canvas.getWidth(),
			h: +lns.canvas.getHeight(),
			fps: +lns.anim.fps,
			mc: [...new Set(lns.anim.layers.map(layer => layer.color))].length > 1, // filter
		};
		if (params.bg) json.bg = lns.canvas.getBGColor();

		lns.draw.reset();
		lns.render.checkEnd();
		

		// get props or clone drawings and layers ??


	}

	function saveLocal() {
		const data = getSaveData(false);
	}

	function saveFile(single, callback) {

		lns.draw.reset();
		lns.render.checkEnd();
		
		lns.anim.drawings.pop(); // remove empty drawing
		lns.anim.layers.pop(); // remove empty draw layer

		fileName = lns.ui.faces.title.value || prompt("Name this file:");

		if (params.fit && confirm("Fit canvas?")) lns.canvas.fitCanvasToDrawing();

		const json = {
			v: "2.5",
			w: +lns.canvas.getWidth(),
			h: +lns.canvas.getHeight(),
			fps: +lns.anim.fps,
			mc: [...new Set(lns.anim.layers.map(layer => layer.color))].length > 1, // filter
		};
		if (params.bg) json.bg = lns.canvas.getBGColor();

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

		const groups = lns.timeline.getGroups();
		if (groups.length > 0) json.g = [...groups];

		if (Object.keys(lns.anim.states).length > 1) {
			json.s = {};
			for (const state in lns.anim.states) {
				if (state != 'default') {
					json.s[state] = [lns.anim.states[state].start, lns.anim.states[state].end];
				}
			}
		}

		const jsonfile = JSON.stringify(json);
		if (fileName) {
			const blob = new Blob([jsonfile], { type: "application/x-download;charset=utf-8" });
			saveAs(blob, `${fileName}${single ? '-' + lns.anim.frame : ''}.json`);
			setTimeout(callback, 500);
			lns.ui.faces.title.value = fileName;
		}
	} /* s key - shift-s for single */

	function saveFramesToFiles() {
		let i = 0;
		function saveFrame() {
			if (i <= lns.anim.endFrame) {
				lns.anim.frame = i;
				saveFile(true, () => {
					i++;
					saveFrame();
				});
			}
		}
		saveFrame();
	}

	/* loads from src url or dragged data ... */
	function loadFile(file, fName) {
		if (typeof file === 'string') { // url
			fileName = file;
			if (fileName) {
				if (fileName.slice(fileName.length - 5) !== '.json')  {
					fileName += '.json';
				}
				fetch(fileName)
					.then(response => { return response.json() })
					.then(data => { 
						loadJSON(data, fileName.split('/').pop()); 
					})
					.catch(error => {console.error(error); });
			}
		} else { // json 
			fileName = f.name.split('.')[0];
			loadJSON(file, fName);
		}
	}

	function loadJSON(data, fName) {
		lns.anim = new Animation(lns.canvas.ctx, lns.render.dps, true);
		lns.anim.loadData(data, function() {
			lns.canvas.setWidth(data.w);
			lns.canvas.setHeight(data.h);
			lns.ui.faces.fps.update(data.fps);
			if (data.bg) lns.canvas.setBGColor(data.bg);
			if (data.g) lns.timeline.setGroups([...data.g]);
			lns.draw.reset(); 
		});

		lns.ui.faces.title.value = fName;
		lns.ui.faces.fps.value = data.fps;
		document.title = fName + ' ~ animate';
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
		saveFile({}, fName => {
			location.href += `?src=/${ prompt("Enter location:") }/${ fName }.json`;
		});
	} /* shift o */

	function openFile() {
		const openFile = document.createElement('input');
		openFile.type = "file";
		openFile.click();
		openFile.onchange = function() {
			readFile(openFile.files);
		};
	} /* o key */

	// replace with UIFile
	function readFile(files, callback) {
		for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					fileName = f.name.split('.')[0];
					loadJSON(JSON.parse(e.target.result), fileName);
				};
			})(f);
			reader.readAsText(f);
		}
	}

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		lns.canvas.canvas.addEventListener('dragover', dragOverHandler);
		lns.canvas.canvas.addEventListener('drop', dropHandler);
		// https://gist.github.com/andjosh/7867934
	}

	function dropHandler(ev) {
 		ev.preventDefault();
 		ev.stopPropagation();
 		readFile(ev.dataTransfer.files, lns.ui.updateFIO); // ? add drag drop to UIFile ... 
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}

	window.addEventListener("beforeunload", function(ev) {
		if (saveSettingsOnUnload) lns.ui.settings.saveSettings();
		if (params.reload) ev.returnValue = 'Did you save dumbhole?';
	});

	function connect() {

		const panel = lns.ui.getPanel('fio', { label: 'Files IO' });
		
		lns.ui.addUIs({
			'title': { id: 'title',  value: fileName, type: 'UIText'} // what?
		});	

		lns.ui.addCallbacks([
			{ callback: saveFile, key: 's', text: 'Save File', args: [false], },
			{ callback: saveFile, key: 'shift-s', text: 'Save Frame', args: [true], },
			{ callback: saveFramesToFiles, key: 'shift-e', text: 'Save Frames to Files', },
			// { callback: openFile, key: 'o', text: 'Open', },
			{ callback: reOpenFile, key: 'shift-o', text: 'Re-Open', },
		]);

		const openFile = new UIFile({
			'text': 'Open',
			key: 'o',
			callback: (data, fName, fPath) => { loadFile(data, fName, fPath); }
		});
	}

	return { connect, loadFile };
}
