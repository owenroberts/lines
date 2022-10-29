/*
	some of this should be in ui now
*/

function FilesIO(lns, params) {

	let saveSettingsOnUnload = params.save || false; // use this ??
	let saveFilesEnabled = false;
	let fileName = undefined;

	function getSaveData(isSingleFrame) {

		const json = {
			title: lns.ui.faces.title.value || prompt("Name this file:"),
			v: "2.5",
			w: +lns.canvas.getWidth(),
			h: +lns.canvas.getHeight(),
			fps: +lns.anim.fps,
			mc: [...new Set(lns.anim.layers.map(layer => layer.color))].length > 1, // filter
		};
		if (params.bg) json.bg = lns.canvas.getBGColor();
		if (!lns.ui.faces.title.value) lns.ui.faces.title.value = json.title;

		lns.draw.reset();
		lns.playback.checkEnd();

		json.d = lns.anim.drawings.map(d => d ? d.getData() : null);
		json.d.pop(); // remove active drawing
		if (json.d.length === 0) return;

		json.l = isSingleFrame ? 
			lns.anim.layers
				.filter(l => l.isInFrame(lns.anim.currentFrame)) 
				.map(l => { return { ...l.getSaveProps(), f: [0, 0] }}) :
			lns.anim.layers.map(l => l.getSaveProps());

		json.l.pop(); // remove active layer
		if (json.l.length === 0) return;

		const groups = lns.timeline.getGroups();
		if (groups.length > 0) json.g = [...groups];

		const states = Object.keys(lns.anim.states).filter(s => s !== 'default');
		if (states.length > 1) {
			json.s = {};
			for (const state in lns.anim.states) {
				json.s[state] = [lns.anim.states[state].start, lns.anim.states[state].end];
			}
		}

		return json;
	}

	function clearLocal() {
		localStorage.removeItem('lines');
	}

	function saveLocal() {
		const json = getSaveData(false);
		if (!json) return alert('No data.');
		localStorage.setItem('lines-' + json.title, JSON.stringify(json));
	}

	function loadLocal() {
		const title = lns.ui.faces.title.value || prompt('Search title');
		if (!title) return alert('No title.');
		
		const localData = localStorage.getItem('lines-' + title);
		if (!localData) return alert('No data, Locals: ' + Object.keys(localStorage).filter(k => k.includes('lines')));
		
		const data = JSON.parse(localData);
		lns.fio.loadJSON(data);
	}

	function saveFile(isSingleFrame, callback) {
		
		if (params.fit && confirm("Fit canvas?")) lns.canvas.fitCanvasToDrawing();
		
		const json = getSaveData(isSingleFrame);
		if (!json) return alert('No data.');

		// const drawingIndexes = new Set(json.l.map(layer => layer.d));
		let drawingIndexes = json.l.map(l => l.d);
		drawingIndexes = drawingIndexes.filter((v, i) => drawingIndexes.indexOf(v) === i);

		json.d = json.d.map((d, i) => drawingIndexes.includes(i) ? d : null); 

		// prune out drawings
		if (json.d.includes(null)) {
			const nonNulls = json.d
				.map((v, i) => { if (json.d[i]) return i; })
				.filter(i => i !== undefined);

			json.l.forEach(l => {
				l.d = nonNulls.indexOf(l.d)
			});

			json.d = json.d.filter(d => d !== null);
		}

		const jsonFile = JSON.stringify(json);

		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, `${json.title}${isSingleFrame ? '-' + lns.anim.frame : ''}.json`);
		setTimeout(callback, 500);
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
			fetch(file)
				.then(response => { return response.json(); })
				.then(data => { loadJSON(data); })
				.catch(error => {console.error(error); });

		} else { // json 
			loadJSON(file);
		}
	}

	function loadJSON(data, fName) {
		const { ctx, canvas } = lns.renderer;
		const { dps } = lns.renderer.getProps();
		lns.anim = new Animation(ctx, dps, true);
		lns.anim.loadData(data, () => {
			// lns.canvas.setWidth(data.w);
			// lns.canvas.setHeight(data.h);
			lns.ui.faces.width.update(data.w);
			lns.ui.faces.height.update(data.h);
			lns.ui.faces.fps.update(data.fps);
			if (data.bg) lns.ui.faces.bgColor.update(data.bg);
			if (data.g) lns.timeline.setGroups([...data.g]);
			lns.draw.reset();
		});

		lns.ui.faces.title.value = data.title || prompt('Name animation?');
		lns.ui.faces.fps.value = data.fps;
		document.title = lns.ui.faces.title.value + ' ~ animate';
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
					loadJSON(JSON.parse(e.target.result));
				};
			})(f);
			reader.readAsText(f);
		}
	}

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		lns.renderer.canvas.addEventListener('dragover', dragOverHandler);
		lns.renderer.canvas.addEventListener('drop', dropHandler);
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
			{ callback: saveLocal, key: 's', text: 'Save Local', args: [false], },
			{ callback: loadLocal,  text: 'Load Local', },
			{ callback: clearLocal, key: 'alt-c', text: 'Clear Local', },
			{ callback: saveFile, key: 'alt-s', text: 'Save File', args: [false], },
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

	return { connect, loadFile, loadJSON };
}
