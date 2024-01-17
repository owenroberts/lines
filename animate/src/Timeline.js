/*
	main editing timeline

	timeline grid structure


*/

function Timeline() {

	let panel, timeline, bigFrameDisplay;

	let frameWidth = 120; // not part of ui ... either make part of ui or member var
	let viewLayers = true;
	let viewActiveLayers = false;
	let viewLayerRange = 0;
	let viewGroups = true;
	let lastGroup; // set last group
	let viewState = false;
	let useScrollToFrame = false;
	let autoFit = false;
	let groups = [];

	// timeline frames
	const tlSteps = [1, 2, 4, 5, 6, 10, 12, 20, 30, 40, 50, 100, 200, 500, 1000];
	let tlInc = 1;
	let tlWidth, tlFrameWidth;


	function init() {
		panel.el.addEventListener('mousemove', ev => {
			// quick select while moving over frames
			if (ev.which == 1 && ev.target.classList.contains('frame') && 
				lns.anim.currentFrame != +ev.target.textContent) {
				lns.draw.reset();
				lns.playback.setFrame(+ev.target.textContent);
				lns.ui.update();
			} else if (ev.which == 3) {
				// scroll right/left -- do this shit ...
			}
		});
	}

	function fit() {
		const f = lns.anim.endFrame + 1;
		const w = panel.el.clientWidth - 11; /* 11 for padding */
		frameWidth = (w - 2 * f) / f;
		timeline.setProp('--frame-width', frameWidth);
		// update();
	}

	function frameClass() {
		// def better way to do this -- did i do something in sequencer??
		if (frameWidth < 5) {
			timeline.addClass('five');
			timeline.removeClass('ten');
		} else if (frameWidth < 10) {
			timeline.addClass('ten');
			timeline.removeClass('five');
		} else {
			timeline.removeClass('ten');
			timeline.removeClass('five');
		}
	}

	function fitFrame() {
		frameWidth = 140;
		timeline.setProp('--frame-width', frameWidth);
		frameClass();
		// update();
		drawLayers();
		scrollToFrame();
	}

	function scrollToFrame(overrideScroll) {
		if (!useScrollToFrame && !overrideScroll) return;
		timeline.el.scrollTo(timeline[`frm-${lns.anim.currentFrame}`].el.offsetLeft - 10, 0);
	}

	/* creates all the layer ui new each time */
	function update() {
		let prevFrame = lns.ui.faces.frameDisplay.value;
		lns.ui.faces.frameDisplay.value = lns.anim.currentFrame;
		bigFrameDisplay.text = lns.anim.currentFrame;
		if (!lns.anim.isPlaying) {
			timeline.clear();
			if (autoFit) fit();
			drawFrames();
			drawLayers();
		} else {
			updateFrame(prevFrame);
		}
	}

	function updateFrame(prevFrame) {
		let prevFrameDisplay = Math.floor(prevFrame / tlInc) * tlInc;
		let nextFrameDisplay = Math.floor(lns.anim.currentFrame / tlInc) * tlInc;

		if (prevFrameDisplay === nextFrameDisplay) return;

		timeline['frm-' + prevFrameDisplay].removeClass('current');
		timeline['frm-' + nextFrameDisplay].addClass('current');
	}

	function swapLayer(layerIndex, swapIndex) {
		if (swapIndex < 0) return;
		[lns.anim.layers[swapIndex], lns.anim.layers[layerIndex]] = [lns.anim.layers[layerIndex], lns.anim.layers[swapIndex]];
		update();
	}

	function sortLayer(layerIndex, swapIndex) {
		if (swapIndex < 0) return;
		const layer = lns.anim.layers.splice(layerIndex, 1);
		lns.anim.layers.splice(swapIndex, 0, layer[0]);
		update();
	}

	function drawFrames() {
		timeline.setProp('--num-frames', lns.anim.endFrame + 1);

		// skip frames at various thresholds
		const numFrames = lns.anim.endFrame + 1;
		tlWidth = panel.el.clientWidth - 11; /* 11 for padding */
		const maxFrameWidth = tlWidth / numFrames;
		frameWidth = Math.floor(tlWidth / numFrames); // +1 ??
		// const roundedFrameWidth = 
		// console.log('df', tlWidth, numFrames, maxFrameWidth);
		if (tlWidth < 0) return;
		const minFrameWidth = 24;
		let nFrameWidth = maxFrameWidth;
		
		let index = 0;
		while (nFrameWidth < minFrameWidth) {
			nFrameWidth = tlWidth / (numFrames / tlSteps[index]);
			index++;
		}
		tlInc = tlSteps[index];
		
		const nf = Math.floor(numFrames / tlInc) + 1;
		tlFrameWidth = Math.floor(tlWidth / nf);

		timeline.setProp('--num-frames', nf);
		timeline.setProp('--frame-width', tlFrameWidth);

		// console.log('tl', Math.floor(numFrames / tlInc) + 1, Math.floor(nFrameWidth), tlWidth)

		for (let i = 0; i < numFrames; i += tlInc) {
			const frameBtn = new UIButton({
				text: `${i}`,
				css: {
					gridColumnStart:  1 + (Math.floor(i / tlInc) * 2),
					gridColumnEnd:  3 + (Math.floor(i / tlInc) * 2)
				},
				class: 'frame',
				callback: function() {
					lns.draw.reset();
					lns.playback.setFrame(i);
					lns.ui.update();
				}	
			});
			// if (i === lns.anim.currentFrame) frameBtn.addClass('current');
			if (Math.floor(i / tlInc) === Math.floor(lns.anim.currentFrame / tlInc)) {
				frameBtn.addClass('current');
			}
			frameBtn.removeClass('btn');
			// lns.ui.keys[i] = frameBtn;
			timeline.append(frameBtn, `frm-${i}`);
		}

		if (lns.anim.stateName !== 'default') {
			timeline.setProp('--state-height', 1);
			const stateLine = new UIElement({
				class: 'state',
				css: {
					gridColumnStart: lns.anim.state.start * 2 + 1,
					gridColumnEnd: (lns.anim.state.end + 1) * 2 + 1,
				}
			});
			timeline.append(stateLine);
		} else {
			timeline.setProp('--state-height', 0);
		}
		
		scrollToFrame();
	}

	function drawLayers() {

		let rowCount = 0; // set rows
		let tweenCount = 0; // tweens

		if (viewLayers) {
			const layers = viewActiveLayers ?
				lns.anim.layers.filter(layer => {
					const f = lns.anim.currentFrame;
					for (let i = f - viewLayerRange; i <= f + viewLayerRange; i++){
						if (layer.isInFrame(i)) return true;
					}
					return false;
				}) :
				lns.anim.layers;

			let gridRowStart = 2;
			let gridRowEnd = 3;

			if (viewGroups) {
				for (let i = 0, len = groups.length; i < len; i++) {
					let groupLayers = layers.filter(l => l.groupNumber === i);
					if (groupLayers.length === 0) continue;
					const startFrame = groupLayers.reduce((a, b) => { 
						return a.startFrame < b.startFrame ? a : b;
					}).startFrame;
					const endFrame = groupLayers.reduce((a, b) => { 
						return a.endFrame < b.endFrame ? a : b;
					}).endFrame;
					groupLayers.forEach(layer => {
						if (layer.startFrame !== startFrame) layer.startFrame = startFrame;
						if (layer.endFrame !== startFrame) layer.endFrame = endFrame;
					});

					const ui = new UITimelineGroup(groupLayers, {
						name: groups[i],
						index: i,
						class: 'group',
						startFrame: startFrame,
						endFrame: endFrame,
						width: frameWidth * (endFrame - startFrame + 1),
						css: {
							gridRowStart: gridRowStart, // 2 + (i * 2),
							gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
							gridColumnStart: startFrame * 2 + 1,
							gridColumnEnd: endFrame * 2 + 3
						},
						update() { lns.ui.update(); },
						reset() { resetLayers(); },
						moveUp() {
							// not sure this will work ...
							groupLayers.forEach(layer => {
								const layerIndex = lns.anim.layers.indexOf(layer);
								const swapIndex = layerIndex - 1;
								swapLayer(layerIndex, swapIndex);
							});
						},
						moveToBack() {
							// go backwards to keep the order
							for (let i = groupLayers.length - 1; i >= 0; i--) {
								const layerIndex = lns.anim.layers.indexOf(groupLayers[i]);
								sortLayer(layerIndex, 0);
							}
						}
					});
					gridRowStart += 2;
					gridRowEnd += 2;
					rowCount++;
					timeline.append(ui, `group-${i}`);
				}
			}

			for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
				const layer = lns.anim.layers[i];
				if (layer.groupNumber >= 0 && viewGroups) continue;
				if (viewActiveLayers && !layers.includes(layer)) continue;
				// if (layer.isToggled) layer.toggle();  // for rebuilding interface constantly
				// console.log(UILayer);

				const colWidth = (tlFrameWidth + 2) * (Math.floor(layer.endFrame / tlInc) - Math.floor(layer.startFrame / tlInc) + 1)
				const ui = new UILayer(layer, {
					group: viewGroups ? undefined : groups[layer.groupNumber],
					canMoveUp: i > 0 && layers.length > 2,
					type: 'layer',
					width: colWidth,
					css: {
						width: colWidth + 'px',
						gridRowStart: gridRowStart, // 2 + (i * 2),
						gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
						gridColumnStart: Math.floor(layer.startFrame / tlInc) * 2 + 1,
						gridColumnEnd: Math.floor(layer.endFrame / tlInc) * 2 + 3
					},
					moveUp() {
						const layerIndex = lns.anim.layers.indexOf(layer);
						const swapIndex = layerIndex - 1;
						swapLayer(layerIndex, swapIndex);
					},
					moveToBack() {
						const layerIndex = lns.anim.layers.indexOf(layer);
						sortLayer(layerIndex, 0);
					},
					addToGroup(position) {
						lns.draw.reset(); // save current lines
						if (groups.length === 0) {
							let createGroup = prompt("Name new group", "New Group 0");
							groups.push(createGroup);
							layer.groupNumber = 0;
							lns.ui.update();
						} else {
							let groupSelector = new UIModal({
								title: 'Select Group',
								app: lns,
								position: position, 
								callback: function() {
									layer.groupNumber = +groupSelect.value;
									lastGroup = +groupSelect.value;
									lns.ui.update();
								}
							});
							groupSelector.addBreak('Groups:');
							let groupSelect = new UISelect({});
							for (let i = 0; i < groups.length; i++) {
								groupSelect.addOption(i, groups[i]);
							}
							if (lastGroup) groupSelect.value = lastGroup;
							groupSelector.add(groupSelect);
							groupSelector.addBreak();
							groupSelector.add(new UIButton({
								text: 'New Group',
								callback: function() {
									groupSelector.clear();
									let createGroup = prompt("Name new group", "New Group " + groups.length);
									groups.push(createGroup);
									layer.groupNumber = groups.length - 1;
									lastGroup = layer.groupNumber;
									lns.ui.update();
								}
							}));
						}
					},
					setLinesProperties: function() {
						lns.draw.setProperties(layer.getEditProps(), true); // set ui only
					},
					update() { lns.ui.update(); },
					reset() { resetLayers(); },
					lineToLayer() {
						lns.draw.reset();
						const layerDrawing = lns.anim.drawings[layer.drawingIndex];
						const currentDrawing = lns.anim.getCurrentDrawing();
						const currentLayer = lns.anim.getDrawLayer();
						currentLayer.startFrame = layer.startFrame;
						currentLayer.endFrame = layer.endFrame;
						const points = [layerDrawing.pop()]; // end
						const temp = []; // points added backwards
						for (let i = layerDrawing.length - 1; i > 0; i--) {
							const p = layerDrawing.pop();
							// if (p !== 'end') currentDrawing.add(p);
							if (p !== 'end') temp.push(p);
							else break;
						}
						for (let i = temp.length - 1; i > 0; i--) {
							currentDrawing.add(temp[i]);
						}
						lns.draw.reset();
						resetLayers();
						update();
					},
					remove(layer) { lns.anim.removeLayer(layer); },
					cloneDrawing() {
						const props = layer.getCloneProps();
						const drawing = lns.anim.drawings[props.drawingIndex];
						const clone = new Drawing();
						for (let i = 0; i < drawing.length; i++) {
							if (drawing.get(i)[0] === 'add') clone.add('add');
							else if (drawing.get(i)[0] === 'end') clone.add('end');
							else clone.add([...drawing.get(i)[0]]);
						}
						lns.anim.drawings.pop();
						lns.anim.drawings.push(clone);
						
						// not sure why but dont need this
						// const newLayer = new Layer({ 
						// 	...props, 
						// 	drawingIndex: lns.anim.drawings.length - 1,
						// });
						// lns.anim.addLayer(newLayer);
						
						lns.draw.reset();
					}
				});
				
				gridRowStart += 2;
				gridRowEnd += 2;
				rowCount++;
				timeline.append(ui, `layer-${i}`);

				/* add tweens -- add methods like getTweens */
				for (let j = 0; j < layer.tweens.length; j++) {
					const tween = layer.tweens[j];
					const tweenUI = new UITween({
						type: 'tween',
						css: {
							width: frameWidth * (tween.endFrame - tween.startFrame + 1) + 'px',
							gridRowStart: gridRowStart, 
							gridRowEnd: gridRowEnd, 
							gridColumnStart: Math.floor(tween.startFrame / tlInc) * 2 + 1,
							gridColumnEnd: Math.floor(tween.endFrame / tlInc) * 2 + 3
						},
						update() { lns.ui.update(); },
					}, tween, layer);
					
					timeline.append(tweenUI, `tween-${j}-layer-${i}`);
					tweenCount++;
					gridRowStart += 2;
					gridRowEnd += 2;
				}
			}
		}

		timeline.setProp('--num-layers', rowCount);
		timeline.setProp('--num-tweens', tweenCount);
	}

	function split() {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame)) {
				/* this is repeated in ui layer */
				const props = layer.getCloneProps();
				props.startFrame = lns.anim.currentFrame + 1;
				lns.anim.addLayer(new Layer(props));
				layer.endFrame = lns.anim.currentFrame;
			}
		}
		lns.playback.setFrame(lns.anim.currentFrame + 1);
	}

	// select all layers in frame
	function select(isSelect) {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame) && layer.isToggled !== isSelect) {
				if (layer.groupNumber >= 0) {
					timeline[`group-${layer.groupNumber}`].toggle.update(isSelect);
				} else {
					timeline[`layer-${i}`].toggle.update(isSelect);
				}
			}
		}
	}

	function lock(isLock) {
		for (let i = 0, len = lns.anim.layers.length - 1; i < len; i++) {
			const layer = lns.anim.layers[i];
			if (layer.isInFrame(lns.anim.currentFrame) && layer.isLocked !== isLock) {
				timeline[`layer-${i}`].lock.update(isLock);
			}
		}
	}

	function resetLayers() {
		for (let i = 0, len = lns.anim.layers.length; i < len; i++) {
			const layer = lns.anim.layers[i];
			layer.reset();
		}
		drawLayers();
	}

	function connect() {
		panel = lns.ui.getPanel('timeline');

		// toggle checks with text need to ignore prop label
		lns.ui.addProps({
			'viewGroups': {
				value: viewGroups,
				text: 'G',
				noLabel: true,
				key: 'backslash',
				callback: value => {
					viewGroups = value;
					update();
				}
			},
			'viewLayers': {
				value: viewLayers,
				key: '[',
				text: 'V',
				class: 'left-end',
				noLabel: true,
				callback: value => {
					viewLayers = value;
					update();
				}
			},
			'viewActiveLayers': {
				value: viewActiveLayers,
				key: ']',
				text: 'V', // toggle text in check ??
				class: 'right-end',
				noLabel: true,
				callback: value => {
					viewActiveLayers = value;
					update();
				}
			},
			'viewLayerRange': {
				type: 'UINumberStep',
				value: viewLayerRange,
				noLabel: true,
				callback: value => { viewLayerRange = value; },
				range: [0, 10],
			},
			'useScrollToFrame': {
				type: 'UIToggle',
				text: 'Follow',
				noLabel: true,
				value: useScrollToFrame,
				callback: value => { useScrollToFrame = value; }
			}
		});

		lns.ui.addCallbacks([
			{ callback: scrollToFrame, key: 'shift-f', text: '⊙', args: [true], },
			{ callback: fit, text: '⇿', key: 'alt-f', class: 'left-end', },
			{ callback: fitFrame, text: '⏛', key: 'ctrl-f', class: 'right-end', },
			{ callback: select, text: 'Select', key: 'shift-v', class: 'left-end', args: [true] },
			{ callback: select, text: 'Deselect', key: 'alt-d', class: 'right-end', args: [false] },
			{ callback: lock, text: 'Lock', key: 'shift-l', class: 'left-end', args: [true] },
			{ callback: lock, text: 'Unlock', key: 'alt-l', class: 'right-end', args: [false] },
			{ callback: split, text: 'Split' },
		]);

		lns.ui.addProps({
			'autoFit': {
				type: 'UIToggleCheck',
				value: autoFit,
				callback(value) { autoFit = value; }
			},
			'stateSelect': {
				type: 'UISelect',
				key: 'ctrl-t',
				label: 'State',
				callback(value) { lns.states.set(value); }
			}
		});

		bigFrameDisplay = lns.ui.addUI({
			type: 'UILabel',
			text: '0',
			id: 'big-frame-display'
		});

		timeline = panel.addRow('timeline');
	}

	return { 
		connect, update, init, 
		getGroups() { return groups; },
		setGroups(value) { groups = value; },
	};

}