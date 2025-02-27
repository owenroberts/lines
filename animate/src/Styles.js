/*
	set layer styles
	default style index 0
	use names?

	don't want to lose basic functionality, when i save some lines and then make changes, it doesn't effect the lines i just changed

	but only want new style when changing a style ... 
*/

import { Elements } from '../../../ui/src/UI.js';
import { Style, Layer } from '../../src/Lines.js';
const { UIButton, UIModal, UIColor } = Elements;

export function Styles(lns, defaults) {

	let styleIndex = 0;
	let changeStyle = false;

	function setStyleIndex(value) {
		if (value >= 0 && value < lns.anim.styles.length) {
			styleIndex = value;
			const layer = lns.anim.getDrawLayer();
			layer.styleIndex = styleIndex;
			updatePropertiesUI();
		} else {
			lns.ui.faces.styleIndex.update(styleIndex, true);
		}
	}

	function getNewStyle() {
		const style = new Style({
			linesInterval: +lns.ui.faces.linesInterval.value,
			segmentNum: +lns.ui.faces.segmentNum.value,
			jiggleRange: +lns.ui.faces.jiggleRange.value,
			wiggleRange: +lns.ui.faces.wiggleRange.value,
			wiggleSpeed: +lns.ui.faces.wiggleSpeed.value,
			color: lns.ui.faces.color.value,
			lineWidth: lns.ui.faces.lineWidth.value,
		});
		// styleIndex = lns.anim.styles.length - 1;
		styleIndex++;
		lns.ui.faces.styleIndex.value = styleIndex;
		changeStyle = false;
		// return style;
		lns.anim.styles.push(style);
		const layer = lns.anim.getDrawLayer();
		layer.styleIndex = styleIndex;
	}

	function getNewLayer(f) {
		return new Layer({
			styleIndex: styleIndex,
			drawingIndex: lns.anim.drawings.length - 1,
			startFrame: +f || lns.anim.currentFrame,
		});
	}

	function reset(f) {
		const drawing = lns.anim.getCurrentDrawing();
		const layer = lns.anim.getDrawLayer();
		let newDrawing = drawing ? false : true;
		if (drawing) {
			if (drawing.length > 0) {
				newDrawing = true;
			}
		}

		if (newDrawing) {
			lns.anim.addNewDrawing();
			/* seems repetietive - settings class ... ? */
			lns.ui.faces.color.addColor(layer.color); // add color to color pallette
			// lns.anim.styles.push(getNewStyle());
			lns.anim.layers.push(getNewLayer(f));
			lns.data.saveState();
			changeStyle = true;
		}  
		// or just change layer frame ?
		lns.ui.update();
		lns.anim.resetDefault();
	} /* r key */

	function setDefault() {
		const style = lns.anim.styles[styleIndex];
		style.reset();
		updatePropertiesUI();
	}

	function setProperty(prop, value) {
		if (changeStyle) {
			getNewStyle();
		}

		const style = lns.anim.styles[styleIndex];
		style[prop] = value;
		// lns.ui.faces[prop].update(style[prop], true); // ui only
	}

	function updatePropertiesUI() {
		const styleProps = lns.anim.styles[styleIndex].getProps();
		for (const prop in styleProps) {
			if (lns.ui.faces[prop]) {
				lns.ui.faces[prop].update(styleProps[prop], true); // ui only
			}
		}
	}

	function quickColorSelect() {
		const modal = new UIModal({ 
			title: "Select Color", 
			app: lns,
			position: lns.mousePosition
		});

		modal.add(new UIColor({
			callback(value){
				setProperty('color', value);
				lns.ui.faces.color.el.value = value; // need this ?
			}
		}));

		lns.ui.faces.color.colors.forEach(color => {
			modal.add(new UIButton({
				text: color,
				css: { background: color },
				value: color,
				callback: () => {
					setProperty('color', color);
					lns.ui.faces.color.el.value = color;
					modal.clear();
				}
			}));
		});
	} /* g key */

	function randomColor() {
		const color = '#' + Math.floor(Math.random()*16777215).toString(16);
		setProperty('color', color);
		lns.ui.faces.color.el.value = color; // need ?
	} /* shift-g */

	function colorVariation() {
		let n = parseInt(lns.anim.getDrawLayer().color.substr(1), 16);
		n += Cool.randomInt(-500, 500);
		n = Math.max(0, n);
		const color = '#' + n.toString(16);
		setProperty('color', color);
		// lns.ui.faces.color.el.value = color; // el ? need ?
	} /* alt-g */

	function connect() {

		const stylePanel = lns.ui.getPanel('styles', { label: 'Styles' });

		lns.ui.addCallbacks([
			{ callback: reset, key: 'r', text: 'Save Lines' },
			{ callback: setDefault, text: 'Reset Default' },
		]);

		lns.ui.addProps({
			'styleIndex': {
				label: 'Style Index',
				type: 'UINumberStep',
				value: 0,
				debug: true,
				callback: value => { 
					changeStyle = false; // fixing change style, test
					setStyleIndex(value);
				},
			},
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
		});

		lns.ui.addCallbacks([
			{ callback: quickColorSelect, key: 'g', text: 'Quick Color', row: true, },
			{ callback: randomColor, key: 'shift-g', text: 'Random Color', },
			{ callback: colorVariation, key: 'alt-g', text: 'Color Variation', },
		]);
	}

	return { 
		connect, reset, setDefault, 
		setStyleIndex,
	};
}