/*
	this is more like mouse events or something ... 
*/

function Draw(lns, defaults) {

	lns.anim.drawings.push(new Drawing());
	lns.anim.layers.push(new Layer({ 
		...defaults, 
		drawingIndex: Math.max(lns.anim.drawings.length - 1, 0),  
		startFrame: lns.anim.currentFrame,
	}));

	function setProperties(props, uiOnly) {
		for (const prop in props) {
			const layer = lns.anim.getDrawLayer();
			if (layer[prop] !== undefined) {
				layer[prop] = props[prop]; // should just be layer prop right??
				// lns.anim.updateProperty(prop, props[prop]);
				if (lns.ui.faces[prop]) lns.ui.faces[prop].update(props[prop], uiOnly); // should just do this .. jesus christ
			}
		}
	}

	function setProperty(prop, value) { // why is this differnt ?? -- really should be prop value
		lns.anim.updateProperty(prop, value);
		lns.anim.getDrawLayer()[prop] = value;
	}

	function setDefaults() {
		setProperties(defaults);
	}

	function reset(f) {
		let drawing = lns.anim.getCurrentDrawing();
		const layer = lns.anim.getDrawLayer();
		let newDrawing = drawing ? false : true;
		if (drawing) {
			if (drawing.length > 0) {
				newDrawing = true;
			}
		}

		if (newDrawing) {
			lns.anim.newDrawing(); // new Drawing?
			/* seems repetietive - settings class ... ? */
			lns.ui.faces.color.addColor(layer.color); // add color to color pallette
			lns.anim.layers.push(getNewLayer(f));
			lns.data.saveState();
		}  
		// or just change layer frame ?
		lns.ui.update();
	} /* r key */

	function getNewLayer(f) {
		return new Layer({
			linesInterval: +lns.ui.faces.linesInterval.value,
			segmentNum: +lns.ui.faces.segmentNum.value,
			jiggleRange: +lns.ui.faces.jiggleRange.value,
			wiggleRange: +lns.ui.faces.wiggleRange.value,
			wiggleSpeed: +lns.ui.faces.wiggleSpeed.value,
			color: lns.ui.faces.color.value,
			lineWidth: lns.ui.faces.lineWidth.value,
			drawingIndex: lns.anim.drawings.length - 1,
			startFrame: +f || lns.anim.currentFrame,
		});
	}

	function cutEnd() {
		/* make sure draw layer doesn't extend to far */
		let endFrame = 0;
		// rewrite with reduce
		for (let i = 0; i < lns.anim.layers.length - 1; i++) {
			const layer = lns.anim.layers[i];
			if (layer.endFrame > endFrame) endFrame = layer.endFrame;
		}
		const layer = lns.anim.getDrawLayer();
		if (layer.endFrame > endFrame) layer.endFrame = endFrame;
		/* layer loop function?? its called forEach dumbass */
	}

	function quickColorSelect() {
		const modal = new UIModal({ title: "Select Color", app: lns, position: lns.mousePosition });
		modal.add(new UIColor({
			callback(value){
				setProperty('color', value);
				lns.ui.faces.color.el.value = value;
			}
		}));
		lns.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { background: color },
				value: color,
				callback() {
					setProperty('color', color,);
					lns.ui.faces.color.el.value = color;
					modal.clear();
				}
			}));
		});
	} /* g key */

	function randomColor() {
		const color = '#' + Math.floor(Math.random()*16777215).toString(16);
		setProperty('color', color);
		lns.ui.faces.color.el.value = color;
	} /* shift-g */

	function colorVariation() {
		let n = parseInt(lns.anim.getDrawLayer().color.substr(1), 16);
		n += Cool.randomInt(-500, 500);
		n = Math.max(0, n);
		const color = '#' + n.toString(16);
		setProperty('color', color);
		lns.ui.faces.color.el.value = color; // el ?
	} /* alt-g */

	function connect() {

		const drawPanel = lns.ui.getPanel('draw', { label: 'Lines' });

		lns.ui.addUI({
			type: 'UIToggleCheck',
			label: 'Suspend',
			value: false,
			key: '/',
			callback: value => {
				lns.anim.suspendUpdate = value;
			}
		});

		drawPanel.addRow();

		lns.ui.addCallbacks([
			{ callback: reset, key: 'r', text: 'Save Lines' },
			{ callback: setDefaults, text: 'Reset Defaults' },
		], 'draw');

		lns.ui.addProps({
			'linesInterval': {
				type: 'UINumberStep',
				value: defaults.linesInterval,
				range: [1, 10],
				callback: value => { setProperty('linesInterval', value); }
			},
			'segmentNum': {
				type: 'UINumberStep',
				value: defaults.segmentNum,
				range: [1, 10],
				callback: value => { setProperty('segmentNum', value); }
			},
			'jiggleRange': {
				type: 'UINumberStep',
				value: defaults.jiggleRange,
				range: [0, 10],
				callback: value => { setProperty('jiggleRange', value); }
			},
			'wiggleRange': {
				type: 'UINumberStep',
				value: defaults.wiggleRange,
				range: [0, 16],
				callback: value => { setProperty('wiggleRange', value); }
			},
			'wiggleSpeed': {
				type: 'UINumberStep',
				value: defaults.wiggleSpeed,
				range: [0, 8],
				step: 0.005,
				callback: value => { setProperty('wiggleSpeed', value); }
			},
			'wiggleSegments': {
				type: 'UIToggleCheck',
				value: defaults.wiggleSegments,
				callback: value => { setProperty('wiggleSegments', value); }
			},
			'breaks': {
				type: 'UIToggleCheck',
				value: defaults.breaks,
				callback: value => { setProperty('breaks', value); }
			},
			'color': {
				type: 'UIColor',
				value: defaults.color, // huh lns.anim.getProps ? 
				callback: value => { setProperty('color', value); }
			},
			lineWidth: {
				type: 'UINumberStep',
				type: 'UINumberStep',
				value: defaults.lineWidth,
				callback: value => { setProperty('lineWidth', value); }
			}
		}, 'draw');

		lns.ui.addCallbacks([
			{ callback: quickColorSelect, key: 'g', text: 'Quick Color', row: true, },
			{ callback: randomColor, key: 'shift-g', text: 'Random Color', },
			{ callback: colorVariation, key: 'alt-g', text: 'Color Variation', },
		], 'draw');
	}

	return { 
		connect, reset, setDefaults, 
		setProperties,
		cutEnd,
	};
}
