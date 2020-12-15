function Data(anim) {
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
			self.saveStates.prev.drawings = _.cloneDeep(anim.drawings);
			self.saveStates.prev.layers = _.cloneDeep(anim.layers);
		}

		self.saveStates.current.drawings = _.cloneDeep(anim.drawings);
		self.saveStates.current.layers = _.cloneDeep(anim.layers);
	};
	
	this.undo = function() {

		if (self.saveStates.prev.drawings) {
			anim.drawings = _.cloneDeep(self.saveStates.prev.drawings);
			anim.layers = _.cloneDeep(self.saveStates.prev.layers);
			
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
		for (let i = 0; i < anim.layers.length - 1; i++) {
			if (anim.layers[i].isInFrame(anim.currentFrame))
				self.copyFrame.push(anim.layers[i]);
		}
	}; /* c key */

	this.paste = function() {
		self.saveState();

		if (self.pasteFrames.length == 0)
			self.pasteFrames.push(anim.currentFrame); 

		/* copy one frame onto multiple */
		for (let i = 0; i < self.pasteFrames.length; i++) {
			for (let j = 0; j < self.copyFrame.length; j++) {
				const layer = self.copyFrame[j].addIndex(self.pasteFrames[i]);
				if (layer) anim.addLayer(layer);
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
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				anim.layers[i].removeIndex(anim.currentFrame, function() {
					anim.layers.splice(i, 1);
				});
				lns.ui.update();
			}
		}
	}; /* called by clear frame */

	/* are these functions useful anymore with timeline ? */
	this.cutTopLayer = function() {
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				anim.layers[i].removeIndex(anim.currentFrame, function() {
					anim.layers.splice(i, 1);
				});
				lns.ui.update();
			}
			break;
		}
	}; /* ctrl - x */

	/* consolidate with above ? */
	this.cutBottomLayer = function() {
		for (let i = 0; i < anim.layers.length - 1; i++) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				anim.layers[i].removeIndex(anim.currentFrame, function() {
					anim.layers.splice(i, 1);
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
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			anim.layers[i].removeIndex(anim.currentFrame, function() {
				anim.layers.splice(i, 1);
			});
		}
		
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			anim.layers[i].shiftIndex(index, -1);
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
		for (let i = 0, len = anim.layers.length - 1; i < len; i++) {
			// insert before dir  0, after 1
			anim.layers[i].shiftIndex(anim.currentFrame + dir, 1);
			anim.addLayer(anim.layers[i].removeIndex(anim.currentFrame + dir));
			anim.frame = anim.currentFrame + dir;
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
		let layers = anim.layers.filter(layer => layer.toggled);
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

	this.quickAnimate = function(type) {
		lns.draw.reset();
		const n = +prompt('Number of frames?');
		for (let i = 0; i < anim.layers.length - 1; i++) {
			const layer = anim.layers[i];
			if (layer.isInFrame(anim.currentFrame)) {
				layer.endFrame = layer.startFrame + n;
				if (anim.state.end < layer.endFrame) anim.state.end = layer.endFrame;
				switch(type) {
					case "Draw":
						layer.addTween({
							prop: 'e',
							sf: layer.f.s,
							ef: layer.f.e,
							sv: 0,
							ev: anim.drawings[layer.d].length
						});
					break;
					case "Reverse":
						layer.addTween({
							prop: 's',
							sf: layer.f.s,
							ef: layer.f.e,
							sv: 0,
							ev: anim.drawings[layer.d].length
						});
					break;
					case "DrawReverse":
						const mid = Math.floor(n / 2);
						layer.addTween({
							prop: 'e',
							sf: layer.f.s,
							ef: layer.f.s + mid,
							sv: 0,
							ev: anim.drawings[layer.d].length
						});
						layer.addTween({
							prop: 's',
							sf: layer.f.s + mid,
							ef: layer.f.e,
							sv: 0,
							ev: anim.drawings[layer.d].length
						});
					break;
				}
			}
		}
		lns.ui.update();
	}; /* a key */
}