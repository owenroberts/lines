function Data() {
	const self = this;

	let copyFrame = []; // copy layers in frame
	let copyFrames = []; // copy multiple frames
	let pasteFrames = []; // frame indexes to paste copy frame to

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

	/* save current state of frames and drawing - one undo */
	this.saveState = function() {
		/*
			if save state already exists, save current to previous state
			if not save previous to new
			always save current to new
		*/

		/*
			use this? https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
		*/

		if (self.saveStates.current.drawings) {
			self.saveStates.prev.drawings = _.cloneDeep(self.saveStates.current.drawings);
			self.saveStates.prev.layers = _.cloneDeep(self.saveStates.current.layers);
		} else {
			self.saveStates.prev.drawings = _.cloneDeep(lns.anim.drawings);
			self.saveStates.prev.layers = _.cloneDeep(lns.anim.layers);
		}

		self.saveStates.current.drawings = _.cloneDeep(lns.anim.drawings);
		self.saveStates.current.layers = _.cloneDeep(lns.anim.layers);
	};
	
	this.undo = function() {

		if (self.saveStates.prev.drawings) {
			lns.anim.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			lns.anim.layers = _.cloneDeep(self.saveStates.prev.layers);
			
			self.saveStates.current.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			self.saveStates.current.layers = _.cloneDeep(self.saveStates.prev.layers);

			self.saveStates.prev.drawings = undefined;
			self.saveStates.prev.layers = undefined;
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}

		/* these functions just call one function, should just call directly .. but this is still being worked on */
		lns.ui.drawings.clear();
		lns.ui.update();
	}; /* ctrl z - undo one save state */

	this.copy = function() {
		lns.draw.reset();
		copyFrame = [];

		// -1 dont copy draw frame 
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame))
				copyFrame.push(lns.anim.layers[i]);
		}
	}; /* c key */

	this.paste = function() {
		self.saveState();

		if (pasteFrames.length == 0) pasteFrames.push(lns.anim.currentFrame);

		/* copy one frame onto multiple */
		for (let i = 0; i < pasteFrames.length; i++) {
			for (let j = 0; j < copyFrame.length; j++) {
				const layer = copyFrame[j].addIndex(pasteFrames[i]);
				if (layer) lns.anim.addLayer(layer);
			}
		}

		pasteFrames = []; // clear pasteframes after paste ??
		lns.draw.reset();
		lns.ui.update();
	}; /* v key */

	this.addMultipleCopies = function() {
		copyFrame = [];
		let n = +prompt("Number of copies: ");
		self.copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.ui.play.next(1);
				self.paste();
			}
		}
		lns.ui.update();
	}; /* shift - c */

	this.copyRange = function() {
		const start = +prompt("Start frame:");
		const end = +prompt("end frame:");
		copyFrames = [];
		for (let i = start; i <= end; i++) {
			copyFrames[i] = [];
			for (let j = 0; j < lns.anim.layers.length - 1; j++) {
				if (lns.anim.layers[j].isInFrame(i))
					copyFrames[i].push(lns.anim.layers[j]);
			}
		}
	}; /* alt - c */

	this.pasteRange = function() {
		for (let i = 0; i < copyFrames.length; i++) {
			const layers = copyFrames[i];
			if (layers) {
				for (let j = 0; j < layers.length; j++) {
					const layer = layers[j].addIndex(lns.anim.currentFrame);
					if (layer) lns.anim.addLayer(layer);
				}
			}
			lns.ui.play.next(1);
		}
		lns.draw.reset();
		lns.ui.update();
	}; /* alt - v */

	// select all -- copy all ?
	// clear selected -- clear paste frames?

	this.clearLines = function() {
		lns.draw.drawing = new Drawing();
	}; /* x key */

	this.clearLayers = function() {
		self.saveState(); /* will save lines ... */
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) {
				lns.anim.layers[i].removeIndex(lns.anim.currentFrame, function() {
					lns.anim.layers.splice(i, 1);
				});
				lns.ui.update();
			}
		}
	}; /* called by clear frame */

	/* are these functions useful anymore with timeline ? */
	this.cutTopLayer = function() {
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) {
				lns.anim.layers[i].removeIndex(lns.anim.currentFrame, function() {
					lns.anim.layers.splice(i, 1);
				});
				lns.ui.update();
			}
			break;
		}
	}; /* ctrl - x */

	/* consolidate with above ? */
	this.cutBottomLayer = function() {
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) {
				lns.anim.layers[i].removeIndex(lns.anim.currentFrame, function() {
					lns.anim.layers.splice(i, 1);
				});
				lns.ui.update();
			}
			break;
		}
	}; /* alt - x */

	this.clearFrame = function() {
		self.clearLines();
		self.clearLayers();
	};	/* shift - x */

	this.deleteFrame = function(_index) {
		const index = _index !== undefined ? _index : lns.anim.currentFrame;
		// lns.draw.reset(); ??
		self.saveState();

		// -2 to skip draw layer
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			lns.anim.layers[i].removeIndex(lns.anim.currentFrame, function() {
				lns.anim.layers.splice(i, 1);
			});
		}
		
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			lns.anim.layers[i].shiftIndex(index, -1);
		}
		lns.ui.update();
	}; /* d key */

	this.deleteFrameRange = function() {
		self.saveState();
		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");

		if (endFrame > 0) {
			for (let i = endFrame; i >= startFrame; i--) {
				self.deleteFrame(i);
			}

			lns.draw.cutEnd();
			lns.ui.play.setFrame(0);
		}
	}; /* shift - d */

	this.cutLastSegment = function() {
		lns.draw.pop(); 
	}; /* z key */

	this.cutLastLine = function() {
		lns.draw.popOff();
	}; /* shift z */

	this.insert = function(dir) {
		lns.draw.reset();
		self.saveState();
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			// insert before dir  0, after 1
			lns.anim.layers[i].shiftIndex(lns.anim.currentFrame + dir, 1);
			lns.anim.addLayer(lns.anim.layers[i].removeIndex(lns.anim.currentFrame + dir));
		}
		lns.ui.play.next(dir);
		lns.ui.update();
	}; /* i, shift-i key */

	this.quickAnimate = function(type) {
		lns.draw.reset();
		const n = +prompt('Number of frames?');
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				layer.endFrame = layer.startFrame + n;
				if (lns.anim.state.end < layer.endFrame) lns.anim.state.end = layer.endFrame;
				switch(type) {
					case "Draw":
						layer.addTween({
							prop: 'endIndex',
							startFrame: layer.startFrame,
							endFrame: layer.endFrame,
							startValue: 0,
							endValue: lns.anim.drawings[layer.drawingIndex].length
						});
					break;
					case "Reverse":
						layer.addTween({
							prop: 'startIndex',
							startFrame: layer.startFrame,
							endFrame: layer.endFrame,
							startValue: 0,
							endValue: lns.anim.drawings[layer.drawingIndex].length
						});
					break;
					case "DrawReverse":
						const mid = Math.floor(n / 2);
						layer.addTween({
							prop: 'endIndex',
							startFrame: layer.startFrame,
							endFrame: layer.startFrame + mid,
							startValue: 0,
							endValue: lns.anim.drawings[layer.drawingIndex].length
						});
						layer.addTween({
							prop: 'startIndex',
							startFrame: layer.startFrame + mid,
							endFrame: layer.endFrame,
							startValue: 0,
							endValue: lns.anim.drawings[layer.drawingIndex].length
						});
					break;
				}
			}
		}
		lns.ui.update();
	}; /* a key */

	this.offsetDrawing = function(offset) {
		// get toggled layers or offset all layers in frame
		let layers = lns.anim.layers.filter(layer => layer.isToggled);
		if (layers.length == 0) {
			layers = lns.anim.layers.filter(layer => layer.isInFrame(lns.anim.currentFrame));
		}

		// then reset drawing to preserve any lines
		lns.draw.reset();

		if (layers) {
			self.saveState();
			if (!offset) offset = new Cool.Vector(+prompt("x"), +prompt("y"));
			if (offset) {
				for (let i = 0; i < layers.length; i++) {
					layers[i].x += offset.x;
					layers[i].y += offset.y;
				}
			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	}; /* q key  */

	this.trimDrawing = function() {
	};

	this.applyOffset = function() {
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const drawing = lns.anim.drawings[layer.drawingIndex];
			for (let i = 0; i < drawing.length; i++) {
				drawing.points[i][0] += layer.x;
				drawing.points[i][1] += layer.y;
			}
			layer.x = 0;
			layer.y = 0;
		}
	};

	this.pruneDrawings = function() {

		const nonNulls = []

		for (let i = 0; i < lns.anim.drawings.length; i++) {
			const drawing = lns.anim.drawings[i];
			if (drawing) nonNulls.push(i);
		}

		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const index = nonNulls.indexOf(layer.drawingIndex);
			layer.drawingIndex = index;
		}

		for (let i = lns.anim.drawings.length; i >= 0; i--) {
			if (lns.anim.drawings[i] == null) lns.anim.drawings.splice(i, 1);
		}
	};
}