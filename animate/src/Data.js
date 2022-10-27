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

function Data(lns) {

	let copyFrame = []; // copy layers in frame
	let copyFrames = []; // copy multiple frames
	let pasteFrames = []; // frame indexes to paste copy frame to
	let saveStates = {
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
	function saveState() {
		// only thing that uses lodash
		/*
			if save state already exists, save current to previous state
			if not save previous to new
			always save current to new
		*/

		/*
			use this? https://stackoverflow.com/questions/728360/how-do-i-correctly-clone-a-javascript-object
		*/

		if (saveStates.current.drawings) {
			saveStates.prev.drawings = _.cloneDeep(saveStates.current.drawings);
			saveStates.prev.layers = _.cloneDeep(saveStates.current.layers);
		} else {
			saveStates.prev.drawings = _.cloneDeep(lns.anim.drawings);
			saveStates.prev.layers = _.cloneDeep(lns.anim.layers);
		}

		saveStates.current.drawings = _.cloneDeep(lns.anim.drawings);
		saveStates.current.layers = _.cloneDeep(lns.anim.layers);
	}
	
	function undo() {

		if (saveStates.prev.drawings) {
			lns.anim.drawings = _.cloneDeep(saveStates.prev.drawings);
			lns.anim.layers = _.cloneDeep(saveStates.prev.layers);
			
			saveStates.current.drawings = _.cloneDeep(saveStates.prev.drawings);
			saveStates.current.layers = _.cloneDeep(saveStates.prev.layers);
			saveStates.prev.drawings = undefined;
			saveStates.prev.layers = undefined;
		} else {
			console.log("%c Can't undo ", "color:lightblue;background:gray;");
		}

		/* these functions just call one function, should just call directly .. but this is still being worked on */
		lns.drawings.clear();
		lns.ui.update();
	} /* ctrl z - undo one save state */

	function copy() {
		lns.draw.reset();
		copyFrame = [];

		// -1 dont copy draw frame 
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (lns.anim.layers[i].isInFrame(lns.anim.currentFrame))
				copyFrame.push(lns.anim.layers[i]);
		}
	} /* c key */

	function paste() {
		saveState();

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
	} /* v key */

	function addMultipleCopies() {
		saveState();
		copyFrame = [];
		let n = +prompt("Number of copies: ", 1);
		copy();
		if (n) {
			for (let i = 0; i < n; i++) {
				lns.render.next(1);
				paste();
			}
		}
		lns.ui.update();
	} /* shift - c */

	function copyRange() {
		saveState();
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
	} /* alt - c */

	function pasteRange() {
		saveState();
		for (let i = 0; i < copyFrames.length; i++) {
			const layers = copyFrames[i];
			if (layers) {
				for (let j = 0; j < layers.length; j++) {
					const layer = layers[j].addIndex(lns.anim.currentFrame);
					if (layer) lns.anim.addLayer(layer);
				}
			}
			lns.render.next(1);
		}
		lns.draw.reset();
		lns.ui.update();
	} /* alt - v */

	function clearLines() {
		saveState();
		lns.draw.setCurrentDrawing(new Drawing());
	} /* x key */

	function clearLayers() {
		saveState(); /* will save lines ... */
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			// console.log(i, lns.anim.layers[i].startFrame);
			if (!lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) continue;
			lns.anim.layers[i].removeIndex(lns.anim.currentFrame, () => {
				lns.anim.layers.splice(i, 1);
			});
		}
		lns.ui.update();
	} /* called by clear frame */

	function cutTopLayer() {
		saveState();
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			if (!lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) continue;
			if (lns.anim.layers[i].groupNumber >= 0) continue;
			lns.anim.layers[i].removeIndex(lns.anim.currentFrame, () => {
				lns.anim.layers.splice(i, 1);
			});
			break;
		}
		lns.ui.update();
	} /* ctrl - x */

	function cutBottomLayer() {
		saveState();
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			if (!lns.anim.layers[i].isInFrame(lns.anim.currentFrame)) continue;
			if (lns.anim.layers[i].groupNumber >= 0) continue;
			lns.anim.layers[i].removeIndex(lns.anim.currentFrame, function() {
				lns.anim.layers.splice(i, 1);
			});
			break;
		}
		lns.ui.update();
	} /* alt - x */

	function clearFrame() {
		saveState();
		clearLines();
		clearLayers();
	}	/* shift - x */

	function deleteFrame(_index) {
		saveState();

		const index = _index !== undefined ? _index : lns.anim.currentFrame;
		const f = lns.anim.currentFrame;
		// -2 to skip draw layer
		for (let i = lns.anim.layers.length - 2; i >= 0; i--) {
			const layer = lns.anim.layers[i];
			if (layer.endFrame < f) continue;
			else if (layer.startFrame === f && layer.endFrame === f) {
				lns.anim.removeLayer(layer);
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
		lns.anim.updateStates();
		lns.ui.update();
	} /* d key */

	function deleteFrameRange() {
		saveState();

		const startFrame = +prompt("Start frame:");
		const endFrame = +prompt("End frame:");

		if (endFrame > 0) {
			for (let i = endFrame; i >= startFrame; i--) {
				deleteFrame(i);
			}

			lns.draw.cutEnd();
			lns.render.setFrame(0);
		}
	} /* shift - d */

	function cutLastSegment() {
		saveState();
		lns.draw.pop(); 
	} /* z key */

	function cutLastLine() {
		saveState();
		lns.draw.popOff();
	} /* shift z */

	function insert(dir) {
		lns.draw.reset();
		saveState();
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			// insert before dir  0, after 1
			lns.anim.layers[i].shiftIndex(lns.anim.currentFrame + dir, 1);
			lns.anim.addLayer(lns.anim.layers[i].removeIndex(lns.anim.currentFrame + dir));
		}
		lns.render.next(dir);
		lns.ui.update();
	} /* i, shift-i key */

	function quickAnimate(type) {
		lns.draw.reset();
		saveState();
		const n = +prompt('Number of frames?');
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (!layer.isInFrame(lns.anim.currentFrame)) continue;

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
		lns.ui.update();
	} /* a key */

	function offsetDrawing(offset) {
		saveState();
		// get toggled layers or offset all layers in frame
		let layers = lns.anim.layers.filter(layer => layer.isToggled);
		if (layers.length == 0) {
			layers = lns.anim.layers.filter(layer => layer.isInFrame(lns.anim.currentFrame));
		}

		// then reset drawing to preserve any lines
		lns.draw.reset();

		if (layers) {
			saveState();
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
	} /* q key  */

	function applyOffset() {
		saveState();
		for (let i = 0; i < lns.anim.layers.length; i++) {
			const layer = lns.anim.layers[i];
			const drawing = lns.anim.drawings[layer.drawingIndex];
			for (let i = 0; i < drawing.length; i++) {
				if (drawing.points[i] === 'end') continue;
				if (drawing.points[i] === 'add') continue;
				drawing.points[i][0] += layer.x;
				drawing.points[i][1] += layer.y;
			}
			layer.x = 0;
			layer.y = 0;
		}
	}

	function pruneDrawings() {
		saveState();

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
	}

	function connect() {

		const copyPanel = lns.ui.getPanel('copy', { label: 'Copy / Paste' });
		lns.ui.addCallbacks([
			{ callback: copy, key: 'c', text: 'Copy' },
			{ callback: addMultipleCopies, key: 'shift-c', text: 'Multi Copy' },
			{ callback: paste, key: 'v', text: 'Paste' },
			{ callback: copyRange, key: 'alt-c', text: 'Copy Range' },
			{ callback: pasteRange, key: 'alt-v', text: 'Paste Range' },
		]);

		const cutPanel = lns.ui.getPanel('cut', { label: 'Cut' });
		lns.ui.addCallbacks([
			{ callback: clearLines, key: 'x', text: 'Clear Lines' },
			{ callback: cutLastLine, key: 'z', text: 'Cut Last Line' },
			{ callback: cutLastSegment, key: 'shift-z', text: 'Cut Last Segment' },
			{ callback: deleteFrame, key: 'd', text: 'Delete Frame' },
			{ callback: deleteFrameRange, key: 'shift-d', text: 'Delete Frame Range' },
			{ callback: cutTopLayer, key: 'ctrl-x', text: 'Cut Top Layer' },
			{ callback: cutBottomLayer, key: 'alt-x', text: 'Cut Bottom Layer' },
			{ callback: clearFrame, key: 'shift-x', text: 'Clear Frame' },
		]);

		const dataPanel = lns.ui.getPanel('data');
		lns.ui.addCallbacks([
			{ callback: undo, key: 'ctrl-z', text: 'Undo', },
			{ callback: offsetDrawing, key: 'shift-o', text: 'Offset', },
			{ callback: insert, key: 'i', text: 'Insert Before', args: [0], },
			{ callback: insert, key: 'shift-i', text: 'Insert After', args: [1], },
			{ callback: applyOffset, text: 'Apply Offset', },
			{ callback: pruneDrawings, text: 'Prune Drawings', },
		]);

		const animatePanel = lns.ui.getPanel('animate');
		lns.ui.addCallbacks([
			{ callback: quickAnimate, key: 'a', text: 'Draw', args: ['Draw'], },
			{ callback: quickAnimate, key: 'shift-a', text: 'Reverse', args: ['Reverse'], },
			{ callback: quickAnimate, key: 'ctrl-a', text: 'Draw + Reverse', args: ['DrawReverse'], },
		]);
	}

	return { connect, saveState };
}