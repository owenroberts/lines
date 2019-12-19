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

	/* ctrl z - undo one save state */
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
		lns.ui.layers.clear();
		lns.ui.update();
	};

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
				self.copyFrame[j].addIndex(self.pasteFrames[i]);
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
		const someSelected = Array.from(lns.ui.list.children).filter(elem => elem.classList.contains('selected')).length < lns.ui.list.children.length - 1;
		lns.ui.list.looper(elem => {
			if (someSelected) elem.classList.remove('selected');
			self.selectFrame(elem);
		});
	}; /* shift v */

	this.selectRange = function() {
		const start = prompt("Start frame:");
		const end = prompt("end frame:");
		lns.ui.list.looper(elem => {
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
		lns.draw.drawing = [];
	}; /* x key */

	this.clearLayers = function() {
		self.saveState(); /* will save lines ... */
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				const layer = anim.layers[i].removeIndex(anim.currentFrame);
				if (!layer) lns.ui.layers.remove(i);
			}
		}
	};

	this.cutTopLayer = function() {
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				const layer = anim.layers[i].removeIndex(anim.currentFrame);
				if (!layer) lns.ui.layers.remove(i);
			}
			break;
		}
	}; /* ctrl - x */

	this.cutBottomLayer = function() {
		for (let i = 0; i < anim.layers.length; i++) {
			if (anim.layers[i].isInFrame(anim.currentFrame)) {
				const layer = anim.layers[i].removeIndex(anim.currentFrame);
				if (!layer) lns.ui.layers.remove(i);
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
		self.saveState();

		// -2 to skip draw layer
		for (let i = anim.layers.length - 2; i >= 0; i--) {
			layer = anim.layers[i].shiftIndex(index, -1);
			if (!layer) lns.ui.layers.remove(i);
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
		lns.ui.layers.cutLayerSegment();
		lns.draw.pop(); 
	}; /* z key */

	this.cutLastLine = function() {
		lns.ui.layers.cutLayerLine(); 
		lns.draw.popOff();
	}; /* shift z */

	this.insert = function(args) {
		lns.draw.reset();
		self.saveState();
		for (let i = 0, len = anim.layers.length - 1; i < len; i++) {
			anim.layers[i].shiftIndex(anim.currentFrame + args.dir, 1);
			const layer = anim.layers[i].removeIndex(anim.currentFrame + args.dir);
			if (!layer) lns.ui.layers.remove(i);
			else if (anim.layers.indexOf(layer) == -1)
				lns.anim.layers.splice(lns.anim.layers.length - 1, 0, layer);
			anim.frame = anim.currentFrame + args.dir;
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
				lns.ui.nextFrame();
				self.paste();
			}
		}
		lns.ui.update();
	}; /* shift -c  */

	this.offsetDrawing = function(offset) {
		lns.draw.reset();
		const _layers = [];
		const togs = lns.anim.layers.some(layer => { return layer.toggled });
		for (let i = 0; i < anim.layers.length - 1; i++) {
			const layer = anim.layers[i];
			if (layer.isInFrame(anim.currentFrame) && !togs || togs && layer.toggled) 
					_layers.push(anim.layers[i]);
		}
		if (_layers) {
			self.saveState();
			if (!offset) offset = new Cool.Vector(+prompt("x"), +prompt("y"));
			if (offset) {
				// check to see if layers are selected
				let layers = [];
				if (lns.ui.layers.length > 0) {
					for (let i = 0; i < lns.ui.layers.length; i++) {
						if (lns.ui.layers[i].toggled)
							layers.push(lns.ui.layers[i])
					}
				} else {
					layers = _layers;
				}

				for (let i = 0; i < layers.length; i++) {
					layers[i].x += offset.x;
					layers[i].y += offset.y;
				}
			}
		} else {
			console.log("%c No layers in frame ", "color:yellow; background:black;");
		}
	}; /* q key  */

	this.explode = function(params) {
		lns.draw.reset();
		const n = +prompt('Number of frames?');
		for (let i = 0; i < anim.layers.length - 1; i++) {
			const layer = anim.layers[i];
			if (layer.isInFrame(anim.currentFrame)) {
				layer.endFrame = layer.startFrame + n;
				if (anim.currentState.end < layer.endFrame) anim.currentState.end = layer.endFrame;
				switch(params.type) {
					case "Explode":
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
					case "ExRev":
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
