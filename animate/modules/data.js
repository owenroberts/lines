function Data() {
	const self = this;

	this.copyFrame = []; // copy layers in frame
	this.pasteFrames = []; // frame indexes to paste

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

		/* these functions just call one function, should just call directly .. but this is still being worked on*/
		lns.ui.drawings.clear();
		lns.ui.update();
	}; /* ctrl z - undo one save state */

	this.copy = function() {
		lns.draw.reset();
		self.copyFrame = [];

		// -1 dont copy draw frame 
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame))
				self.copyFrame.push(lns.anim.layers[i]);
		}
	}; /* c key */

	this.paste = function() {
		self.saveState();

		if (self.pasteFrames.length == 0)
			self.pasteFrames.push(lns.anim.currentFrame); 

		/* copy one frame onto multiple */
		for (let i = 0; i < self.pasteFrames.length; i++) {
			for (let j = 0; j < self.copyFrame.length; j++) {
				const layer = self.copyFrame[j].addIndex(self.pasteFrames[i]);
				if (layer) lns.anim.addLayer(layer);
			}
		}

		self.clearSelected();
		lns.draw.reset();
		lns.ui.update();
	}; /* v key */

	this.selectFrame = function(elem) {
		if (!elem.classList.contains("selected")) {
			elem.classList.add("selected");
			self.pasteFrames.push(+elem.textContent);
		} else {
			self.pasteFrames.splice(self.pasteFrames.indexOf(+elem.textContent), 1);
			elem.classList.remove("selected");
		}
	};

	this.selectAll = function() {
		/* if less than all are selected deselect those first */
		const someSelected = Array.from(lns.ui.frames.children).filter(elem => elem.classList.contains('selected')).length < lns.ui.frames.children.length - 1;
		lns.ui.frames.looper(elem => {
			if (someSelected) elem.classList.remove('selected');
			self.selectFrame(elem);
		});
	}; /* shift v */

	this.selectRange = function() {
		const start = prompt("Start frame:");
		const end = prompt("end frame:");
		lns.ui.frames.looper(elem => {
			self.selectFrame(elem);
		}, start, end);
	}; /* alt v */

	this.clearSelected = function() {
		self.pasteFrames = [];

		/* this is a ui thing ... */
		const copyFrameElems = document.getElementsByClassName("selected");
		for (let i = copyFrameElems.length - 1; i >= 0; i--) {
			copyFrameElems[i].classList.remove("selected");
		}
	}; /* ctrl v */

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
			lns.ui.setFrame(0);
		}
	}; /* shift-d */

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
			lns.anim.frame = lns.anim.currentFrame + dir;
		}
		lns.ui.update();
	}; /* i, shift-i key */

	this.addMultipleCopies = function() {
		self.copyFrame = [];
		self.clearSelected();
		let n = +prompt("Number of copies: ");
		self.copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.ui.play.next(1);
				self.paste();
			}
		}
		lns.ui.update();
	}; /* shift -c  */

	this.offsetDrawing = function(offset) {
		// get toggled layers or offset all layers in frame
		let layers = lns.anim.layers.filter(layer => layer.isToggled);
		if (layers.length == 0) {
			layers = lns.lns.anim.layers.filter(layer => layer.isInFrame(lns.lns.anim.currentFrame));
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
							endValue: lns.anim.drawings[layer.drawindIndex].length
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
}