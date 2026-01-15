/*
	data module 
	what is this really?
	prob need multiple modules
	really just a bunch of ui, callbacks ...
	separate
		- save states
		- animation
		- clear delete etc
		- copy paste
	some stuff can be moved to lines mixin
	partly all here because it does save state after each ...
*/

import { UIPanel } from '../../../oi/src/oi.js';

export class DataPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "data", ui });

		this.anim = anim;

		this.copyFrameLayers = [];
		this.copyMultiFrameLayers = [];
		this.pasteFrameIndexes = [];

		this.saveStates = {
			current: {
				drawings: undefined,
				layers: undefined
			},
			prev: {
				drawings: undefined,
				layers: undefined
			}
		};

		// copy paste 
		this.addLabel("copy/paste");
		// *** redo all the panel labels ... maybe need row? collection ... 
		this.addBreak();

		// *** do this in other modules
		this.addButtons(
			{ obj: this },
			[
				{ key: "c", ref: "copy", },
				{ key: "shift-c", ref: "addMultipleCopies", },
				{ key: "v", ref: "paste", },
				{ key: "alt-c", ref: "copyRange", },
				{ key: "alt-v", ref: "pasteRange", },
			]
		);

		this.addBreak();
		this.addLabel("cut");
		this.addBreak();

		this.addButtons(
			{ obj: this },
			[
				{ key: "x", ref: "clearLines", },
				{ key: "z", ref: "cutLastLine", },
				{ key: "shift-z", ref: "cutLastSegment", },
				{ key: "d", ref: "deleteFrame", },
				{ key: "shift-d", ref: "deleteFrameRange", },
				{ key: "ctrl-x", ref: "cutTopLayer", },
				{ key: "alt-x", ref: "cutBottomLayer", },
				{ key: "shift-x", ref: "clearFrame", },
			]
		);

		this.addBreak();
		this.addLabel("data");
		this.addBreak();

		this.addButtons(
			{ obj: this },
			[
				{ key: 'ctrl-z', ref: "undo",  },
				{ key: 'shift-o', ref: "offsetDrawing" },
				{ key: 'i', ref: "insertBefore" },
				{ key: 'shift-i', ref: "insertAfter" },
				{ ref: "applyOffset", },
				{ ref: "pruneDrawings", },
			]
		);
	}

	saveState() {
		if (this.saveStates.current.drawings) {
			this.saveStates.prev.drawings = structuredClone(this.saveStates.current.drawings);
			this.saveStates.prev.layers = structuredClone(this.saveStates.current.layers);
		} else {
			this.saveStates.prev.drawings = structuredClone(this.anim.drawings);
			this.saveStates.prev.layers = structuredClone(this.anim.layers);
		}

		this.saveStates.current.drawings = structuredClone(this.anim.drawings);
		this.saveStates.current.layers = structuredClone(this.anim.layers);
	}
	
	// *** needs later testing
	undo() {

		if (saveStates.prev.drawings) {
			this.anim.drawings = structuredClone(saveStates.prev.drawings);
			this.anim.layers = structuredClone(saveStates.prev.layers);
			
			saveStates.current.drawings = structuredClone(saveStates.prev.drawings);
			saveStates.current.layers = structuredClone(saveStates.prev.layers);
			saveStates.prev.drawings = undefined;
			saveStates.prev.layers = undefined;
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}

		/* these functions just call one function, should just call directly .. but this is still being worked on */
		lns.drawings.clear();
		lns.ui.update();
	}

	copy() {
		this.ui.panels.styles.reset();
		this.copyFrameLayers = [];
		// -1 dont copy draw frame -- *** redo this part
		// use getLayersInFrame ***
		for (let i = 0; i < this.anim.layers.length - 1; i++) {
			if (this.anim.layers[i].isInFrame(this.anim.currentFrame)) {
				this.copyFrameLayers.push(this.anim.layers[i]);
			}
		}
	}

	paste() {
		this.saveState();

		if (this.pasteFrameIndexes.length === 0) {
			this.pasteFrameIndexes.push(this.anim.currentFrame);
		}

		for (let i = 0; i < this.pasteFrameIndexes.length; i++) {
			for (let j = 0; j < this.copyFrameLayers.length; j++) {
				const layer = this.copyFrameLayers[j].addIndex(this.pasteFrameIndexes[i]);
				if (layer) this.anim.addLayer(layer);
			}
		}

		// clear paste frame indexes
		this.pasteFrameIndexes = [];
		
		this.ui.panels.styles.reset();
		this.ui.update();
	}

	addMultipleCopies() {
		this.saveState();
		this.copyFrameLayers = [];
		let n = +prompt("numer of frames to add copy: ", 1);
		this.copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				this.ui.panels.playback.next(1);
				this.paste();
			}
		}
		this.ui.update();
	}

	copyRange() {
		this.saveState();
		const start = +prompt("Start frame:");
		const end = +prompt("end frame:");
		this.copyMultiFrameLayers = [];
		for (let i = start; i <= end; i++) {
			this.copyMultiFrameLayers[i] = [];
			for (let j = 0; j < this.anim.layers.length - 1; j++) {
				if (this.anim.layers[j].isInFrame(i))
					this.copyMultiFrameLayers[i].push(this.anim.layers[j]);
			}
		}
	}

	pasteRange() {
		this.saveState();
		for (let i = 0; i < this.copyMultiFrameLayers.length; i++) {
			const layers = this.copyMultiFrameLayers[i];
			if (layers) {
				for (let j = 0; j < layers.length; j++) {
					const layer = layers[j].addIndex(this.anim.currentFrame);
					if (layer) this.anim.addLayer(layer);
				}
			}
			this.ui.panels.playback.next(1);
		}
		this.ui.panels.styles.reset();
		lns.ui.update();
	}

	clearLines() {
		this.saveState();
		this.anim.activeDrawing.reset();
	}

	// *** needs later testing
	clearLayers() {
		this.saveState(); /* will save lines ... */
		for (let i = this.anim.layers.length - 2; i >= 0; i--) {
			// console.log(i, this.anim.layers[i].startFrame);
			if (!this.anim.layers[i].isInFrame(this.anim.currentFrame)) continue;
			this.anim.layers[i].removeIndex(this.anim.currentFrame, () => {
				this.anim.layers.splice(i, 1);
			});
		}
		lns.ui.update();
	}

	// *** needs later testing
	cutTopLayer() {
		this.saveState();
		for (let i = this.anim.layers.length - 2; i >= 0; i--) {
			if (!this.anim.layers[i].isInFrame(this.anim.currentFrame)) continue;
			if (this.anim.layers[i].groupNumber >= 0) continue;
			this.anim.layers[i].removeIndex(this.anim.currentFrame, () => {
				this.anim.layers.splice(i, 1);
			});
			break;
		}
		lns.ui.update();
	}

	// *** needs later testing
	cutBottomLayer() {
		this.saveState();
		for (let i = 0; i < this.anim.layers.length - 1; i++) {
			if (!this.anim.layers[i].isInFrame(this.anim.currentFrame)) continue;
			if (this.anim.layers[i].groupNumber >= 0) continue;
			this.anim.layers[i].removeIndex(this.anim.currentFrame, function() {
				this.anim.layers.splice(i, 1);
			});
			break;
		}
		lns.ui.update();
	}

	// *** needs later testing
	clearFrame() {
		this.saveState();
		this.clearLines();
		this.clearLayers();
	}

	// *** needs later testing
	deleteFrame(_index) {
		this.saveState();

		const index = _index !== undefined ? _index : this.anim.currentFrame;
		const f = this.anim.currentFrame;
		// -2 to skip draw layer *** fix anything with draw layer ... maybe
		// 
		for (let i = this.anim.layers.length - 2; i >= 0; i--) {
			const layer = this.anim.layers[i];
			if (layer.endFrame < f) continue;
			else if (layer.startFrame === f && layer.endFrame === f) {
				this.anim.removeLayer(layer);
			}
			else if (layer.endFrame > f && layer.startFrame > f) {
				layer.startFrame -= 1;
				layer.endFrame -= 1;
			}
			else if (layer.endFrame > f) {
				layer.endFrame -= 1;
			}
			layer.resetTweens();
		}
		this.anim.updateStates();
		lns.ui.update();
	}

	// *** needs later testing
	deleteFrameRange() {
		this.saveState();

		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");

		if (endFrame > 0) {
			for (let i = endFrame; i >= startFrame; i--) {
				this.deleteFrame(i);
			}

			this.anim.cutEnd();
			this.ui.panels.playback.setFrame(0);
		}
	}

	cutLastSegment() {
		this.saveState();
		this.anim.activeDrawing.popPoint();
	}

	cutLastLine() {
		this.saveState();
		this.anim.activeDrawing.popLine();
	}

	insert(dir=0) {
		this.ui.panels.styles.reset();
		this.saveState();
		for (let i = 0, len = this.anim.layers.length - 1; i < len; i++) {
			// insert before dir  0, after 1
			this.anim.layers[i].shiftIndex(this.anim.currentFrame + dir, 1);
			this.anim.addLayer(this.anim.layers[i].removeIndex(this.anim.currentFrame + dir));
		}
		this.anim.shiftStates(this.anim.currentFrame + dir);
		this.ui.panels.playback.next(dir);
		this.ui.update();
	}

	insertBefore() { this.insert(0); }
	insertAfter() { this.insert(1); }

	// any real reason not to apply to begin with?
	offsetDrawing(offset) {
		this.saveState();
		// get toggled layers or offset all layers in frame
		let layers = this.anim.layers.filter(layer => layer.isToggled);
		if (layers.length == 0) {
			layers = this.anim.layers.filter(layer => layer.isInFrame(this.anim.currentFrame));
		}

		// then reset drawing to preserve any lines
		this.ui.panels.styles.reset();

		if (layers) {
			this.saveState();
			if (!offset) offset = { x: +prompt("x"), y: +prompt("y") };
			if (offset) {
				for (let i = 0; i < layers.length; i++) {
					layers[i].x += offset.x;
					layers[i].y += offset.y;
				}
			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	}

	// *** needs later testing
	applyOffset() {
		this.saveState();
		for (let i = 0; i < this.anim.layers.length; i++) {
			const layer = this.anim.layers[i];
			const drawing = this.anim.drawings[layer.drawingIndex];
			for (let i = 0; i < drawing.length; i++) {
				if (drawing.points[i] === Points.END) continue;
				if (drawing.points[i] === Points.ADD) continue;
				drawing.points[i][0] += layer.x;
				drawing.points[i][1] += layer.y;
			}
			layer.x = 0;
			layer.y = 0;
		}
	}

	// *** needs later testing
	pruneDrawings() {
		this.saveState();
		this.anim.pruneDrawings();
		this.ui.update();
	}

	// *** test
	pruneStyles() {
		this.saveState();
		this.anim.pruneStyles();
	}
}