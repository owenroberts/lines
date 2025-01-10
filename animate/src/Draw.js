/*
	this is more like mouse events or something ... 
*/

import { Drawing, Layer } from '../../src/Lines.js';
import { Elements } from '../../../ui/src/UI.js';
const { UIButton, UIModal, UIColor } = Elements;

export function Draw(lns, defaults) {

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

		drawPanel.addRow();

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
