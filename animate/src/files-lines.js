import { saveAs } from 'file-saver';
import { Drawing, Layer, LINES_VERSION } from '../../src/lines.js';
import { AnimateAnim } from './animate-anim.js';
import { UIModal, UIButton, UIPanel } from '../../../oi/src/oi.js';
import { FileManager } from '../../src/lines-file-manager.js';

export class FilesPanel extends UIPanel {
	constructor(ui, anim, renderer) {
		super({ id: 'files', ui });
		
		this.anim = anim;
		this.renderer = renderer;
		this.fm = new FileManager(anim, renderer);

		this.fitCanvasToDrawing = false;
		this.isReloadWarning = false;
		this.saveSettingsOnUnload = false;
		this.fileName = "name this file";

		this.addRef({
			obj: this,
			ref: "fileName",
			ignoreSettings: true,
		});

		this.addRefs(
			{ obj: this },
			[
				{ ref: "fitCanvasToDrawing", },
				{ ref: "isReloadWarning", },
				{ ref: "saveSettingsOnUnload", },
			]
		);

		this.addBreak();

		this.addButtons(
			{ obj: this },
			[
				{ ref: "saveLocal", key: 's', },
				{ ref: "loadLocal", key: 'l', },
				{ ref: "listLocal", key: 'ctrl-l' },
				{ ref: "clearLocal", key: 'alt-c', },
				{ ref: "saveFile", key: 'alt-s', },
				{ ref: "saveFrame", key: 'shift-s', },
				{ ref: "saveFramesToFiles", key: 'alt-f', },
			]
		);

		this.addButton({ 
			type: 'UIFile', 
			text: 'load file', 
			key: 'o',
			callback: (data, fName, fPath) => { 
				this.loadJSON(data, fName, fPath); 
			}, 
		});

		this.addButton({ 
			type: 'UIFile', 
			text: 'add drawings',
			callback: (data) => { 
				this.addDrawingsFromFile(data, true); 
			}, 
		});

		this.addButton({ 
			type: 'UIFile', 
			text: 'append drawings', 
			callback: (data) => { 
				this.addDrawingsFromFile(data, false); 
			}, 
		});

		this.renderer.canvas.addEventListener('dragover', ev => {
			this.dragOverHandler(ev);
		});

		this.renderer.canvas.addEventListener('drop', ev => {
			this.dropHandler(ev)
		});

		window.addEventListener("beforeunload", function(ev) {
			if (this.saveSettingsOnUnload) this.ui.settings.save();
			if (this.isReloadWarning) ev.returnValue = 'did you save dumbhole?';
		});
	}

	clearLocal() {
		const title = this.fileName;
		if (!title) alert('no title');
		localStorage.removeItem('lines-' + title);
		localStorage.removeItem('lines-title');
	}

	saveLocal(isSingleFrame=false) {
		
		this.ui.panels.styles.reset();
		this.ui.panels.playback.checkEnd();
		this.ui.panels.data.pruneDrawings();
		this.ui.panels.data.pruneStyles();

		if (this.fileName === "name this file") {
			this.fileName = prompt("name file");
		}

		const json = this.fm.saveData(this.fileName, this.ui.panels.timeline.groups, isSingleFrame);
		console.log('save local', json);
		
		if (!json) return alert('no data.');

		try {
			localStorage.setItem('lines-' + json.title, JSON.stringify(json));
			localStorage.setItem('lines-title', json.title);
			this.children.fileName.value = this.fileName;
		} catch(error) {
			if (error.name === 'QuotaExceededError') alert('Local storage full');
			else alert(error.name);
		}
		
		return json;
	}

	loadLocal(titleFromList) {
		let title = titleFromList ?? localStorage.getItem('lines-title');
		if (!title) return alert('no title.');
		
		const localData = localStorage.getItem('lines-' + title);
		if (!localData) {
			return alert('No data, Locals: ' + Object.keys(localStorage).filter(k => k.includes('lines')));
		}
		const data = JSON.parse(localData);
		this.ui.faces.fileName.update(data.title);
		console.log('load local', data);
		this.loadJSON(data);
	}

	loadJSON(data, fName) {
		this.fm.loadData(data);
		
		// avoid errors with grid
		this.anim.isMultiColor = true;
		this.anim.isMultiLineWidth = true;

		this.ui.faces.width.update(data.w);
		this.ui.faces.height.update(data.h);
		if (data.bg) this.ui.faces.bgColor.update(data.bg);
		if (data.g) this.ui.panels.timeline.groups = [...data.g];
		
		this.ui.panels.styles.reset();

		this.children.fileName.value = data.title;
		this.anim.styles.forEach(style => {
			this.ui.faces.color.addColor(style.color);
		});
		// if (data.q) this.ui.panels.sequencer.load(); // *** add sequencer
		this.ui.update();
	}

	listLocal() {
		const m = new UIModal({
			title: 'local saves',
			ui: this.ui,
		});

		const localSaves = Object.keys(localStorage)
			.filter(k => !k.includes("settings"))
			.filter(k => !k.includes("title"))
			.filter(k => k.includes('lines'));
		
		localSaves.forEach(title => {
			m.add(new UIButton({
				text: title.replace('lines-', ''),
				callback: () => { 
					this.loadLocal(title.replace('lines-', ''));
					m.clear();
				}
			}));
			m.add(new UIButton({
				text: "X",
				callback: () => {
					localStorage.removeItem(title);
					m.clear();
				}
			}));
			m.addBreak();
		});
	}

	saveFile(isSingleFrame=false, callback) {
		
		// i think this was useful to do in bulk at one point, ignore for now
		if (this.fitCanvasToDrawing && confirm("fit canvas?")) {
			this.ui.panels.canvas.fitCanvasToDrawing();
		}

		const json = this.saveLocal(isSingleFrame);
		const jsonFile = JSON.stringify(json);
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		let fileName = json.title;
		if (isSingleFrame) fileName += `-${this.anim.currentFrame}`;
		saveAs(blob, `${fileName}.json`);
		setTimeout(callback, 500); // delay to save files better
	}

	saveFrame() { this.saveFile(true); }

	saveFramesToFiles() {
		let i = 0;
		const saveFrame = () => {
			if (i <= this.anim.endFrame) {
				this.anim.currentFrame = i;
				this.saveFile(true, () => {
					i++;
					saveFrame();
				});
			}
		};
		saveFrame();
	}

	addDrawingsFromFile(data, isOverlay) {
		const drawings = data.d;
		const layers = data.l;
		const drawingsAdded = [];
		const addFrames = isOverlay ? 0 : this.anim.endFrame + 1;

		for (let i = 0; i < layers.length; i++) {
			const layerParams = this.fm.loadLayerParams(layers[i]);
			const layer = new Layer(layerParams);
			layer.startFrame += addFrames;
			layer.endFrame += addFrames;

			const newDrawingIndex = this.anim.drawings.length - 1;
			const drawing = new Drawing(drawings[layerParams.drawingIndex]);
			
			layer.drawingIndex = newDrawingIndex;

			this.anim.addDrawing(drawing);
			this.anim.addLayer(layer);
		}

		// const drawLayer = this.anim.getDrawLayer();
		this.anim.activeLayer.drawingIndex = this.anim.drawings.length - 1;

		this.ui.panels.styles.reset();
		this.ui.update();
	}

	readFile(files, callback) {
		for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
				continue;
			}
			const reader = new FileReader();
			reader.onload = ((theFile) => {
				return (e) => {
					this.loadJSON(JSON.parse(e.target.result));
				};
			})(f);
			reader.readAsText(f);
		}
	}

	dropHandler(ev) {
 		ev.preventDefault();
 		ev.stopPropagation();
 		this.readFile(ev.dataTransfer.files); 
 		// ? add drag drop to UIFile ... 
	}

	dragOverHandler(ev) {
		ev.preventDefault();
	}
}
