/*
	main editing timeline
*/

function Timeline() {

	let panel, timeline;

	let frameWidth = 120; // not part of ui ... either make part of ui or member var
	let viewLayers = true;
	let viewActiveLayers = false;
	let viewLayerRange = 0;
	let viewGroups = true;
	let updateDuringPlay = false;
	let useScrollToFrame = false;
	let groups = [];

	function init() {
		panel.el.addEventListener('mousemove', ev => {
			// quick select while moving over frames
			if (ev.which == 1 && ev.target.classList.contains('frame') && 
				lns.anim.currentFrame != +ev.target.textContent) {
				lns.draw.reset();
				lns.render.setFrame(+ev.target.textContent);
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
		update();
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
		update();
		scrollToFrame();
		drawLayers();
	}

	function scrollToFrame() {
		if (!useScrollToFrame) return;
		timeline.el.scrollTo(timeline[`frm-${lns.anim.currentFrame}`].el.offsetLeft - 10, 0);
	}

	/* creates all the layer ui new each time */
	function update() {

		lns.ui.faces.frameDisplay.value = lns.anim.currentFrame; // eek

		timeline.setProp('--num-frames', lns.anim.endFrame + 1);
		timeline.setProp('--num-tweens', lns.anim.layers.reduce((n, l) => n + l.tweens.length, 0));

		timeline.clear();

		const numFrames = lns.anim.endFrame + 1;
		for (let i = 0; i < numFrames; i++) {
			const frameBtn = new UIButton({
				text: `${i}`,
				css: {
					gridColumnStart:  1 + (i * 2),
					gridColumnEnd:  3 + (i * 2)
				},
				class: 'frame',
				callback: function() {
					lns.draw.reset();
					lns.render.setFrame(i);
					lns.ui.update();
				}	
			});
			if (i == lns.anim.currentFrame) frameBtn.addClass('current');
			frameBtn.removeClass('btn');
			// lns.ui.keys[i] = frameBtn;
			timeline.append(frameBtn, `frm-${i}`);
		}
		
		if (updateDuringPlay || !lns.anim.isPlaying) drawLayers();
		scrollToFrame();
	}

	function drawLayers() {

		let rowCount = 0; // set rows

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
						type: 'group',
						startFrame: startFrame,
						endFrame: endFrame,
						width: frameWidth * (endFrame - startFrame + 1),
						css: {
							gridRowStart: gridRowStart, // 2 + (i * 2),
							gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
							gridColumnStart: startFrame * 2 + 1,
							gridColumnEnd: endFrame * 2 + 3
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
				const ui = new UILayer(layer, {
					group: viewGroups ? undefined : groups[layer.groupNumber],
					canMoveUp: i > 0 && layers.length > 2,
					type: 'layer',
					width: frameWidth * (layer.endFrame - layer.startFrame + 1),
					css: {
						gridRowStart: gridRowStart, // 2 + (i * 2),
						gridRowEnd: gridRowEnd, 	// 3 + (i * 2),
						gridColumnStart: layer.startFrame * 2 + 1,
						gridColumnEnd: layer.endFrame * 2 + 3
					},
					moveUp: function() {
						const layerIndex = lns.anim.layers.indexOf(layer);
						const swapIndex = layerIndex - 1;
						if (swapIndex >= 0) {
							[lns.anim.layers[swapIndex], lns.anim.layers[layerIndex]] = [lns.anim.layers[layerIndex], lns.anim.layers[swapIndex]]
						}
						update();
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
									lns.ui.update();
								}
							});
							groupSelector.addBreak('Groups:');
							let groupSelect = new UISelect({});
							for (let i = 0; i < groups.length; i++) {
								groupSelect.addOption(i, i === 0, groups[i]);
							}
							groupSelector.add(groupSelect);
							groupSelector.addBreak();
							groupSelector.add(new UIButton({
								text: 'New Group',
								callback: function() {
									groupSelector.clear();
									let createGroup = prompt("Name new group", "New Group " + groups.length);
									groups.push(createGroup);
									layer.groupNumber = groups.length - 1;
									lns.ui.update();
								}
							}));
						}
					},
					setLinesProperties: function() {
						lns.draw.setProperties(layer.getEditProps(), true); // set ui only
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
							gridRowStart: gridRowStart, 
							gridRowEnd: gridRowEnd, 	
							gridColumnStart: tween.startFrame * 2 + 1,
							gridColumnEnd: tween.endFrame * 2 + 3
						},
					}, tween, layer);
					
					timeline.append(tweenUI, `tween-${j}-layer-${i}`);
					
					gridRowStart += 2;
					gridRowEnd += 2;
				}
			}
		}

		timeline.setProp('--num-layers', rowCount);
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
		lns.render.setFrame(lns.anim.currentFrame + 1);
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
				callback: value => {
					viewGroups = value;
					update();
				}
			},
			'viewLayers': {
				value: viewLayers,
				key: 'ctrl-l',
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
				key: 'ctrl-l',
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
			{ callback: fit, text: '⇿', key: 'alt-f', class: 'left-end', },
			{ callback: fitFrame, text: '⏛', key: 'ctrl-f', class: 'right-end', },
			{ callback: select, text: 'Select', key: 'shift-v', class: 'left-end', args: [true] },
			{ callback: select, text: 'Deselect', key: 'alt-d', class: 'right-end', args: [false] },
			{ callback: lock, text: 'Lock', key: 'shift-l', class: 'left-end', args: [true] },
			{ callback: lock, text: 'Unlock', key: 'alt-l', class: 'right-end', args: [false] },
			{ callback: split, text: 'Split' },
		]);

		timeline = panel.addRow('timeline');
	}

	return { 
		connect, update, init, 
		getGroups() { return groups; },
		setGroups(value) { groups = value; },
	};

}