/*
	animation params
	need some fucking instructions here ...
	don't call update every frame, it creates tweens
	call update if you want it to change
	** maybe change that func name? **
	also call it at the beginning

	let a = new Animator(lines_animation, params)
	a.update();

	trying to be too clever with this, need to make it more useful, specific
	adds a different tween to each layer, maybe option to add same tween to all layers?
	or maybe rewrite after changing set up to keyframes
*/

import { choice, chance, randomInt } from '../../cool/cool.js';

const defaultParams = {
	jiggleRange: [0, 9],
	wiggleRange: [0, 10],
	wiggleSpeed: [0, 4],
	linesInterval: [1, 10],
	startIndex: [0, 'end'],
	endIndex: [0, 'end'],
};

/**
 * animator - create a bunch of randomized tweens and add to animation layers
 * @param {LinesAnimation} 		- animation
 * @param {object} params    	- params to overwrite defaults
 * @param {string[]} ignore 	- list of params to ignore making tweens
 */
export function Animator(animation, params={}, ignore=[]) {

	let animTweens = [];

	for (const k in defaultParams) {
		if (!params.hasOwnProperty(k) && !ignore.includes(k)) {
			params[k] = defaultParams[k];
		}
	}

	/**
	 * set new tweens
	 */
	function set() {

		for (let i = 0; i < animation.layers.length; i++) {
			const layer = animation.layers[i];

			// remove prev tweens
			for (let j = layer.tweens.length - 1; j >= 0; j--) {
				if (animTweens.includes(layer.tweens[j])) {
					layers.tweens.splice(j, 1);
				}
			}

			animTweens = [];

			const props = { 
				...layer.getProps(), 
				...animation.styles[layer.styleIndex].getProps(), 
			};

			// set tween end props to current layer props
			// this doesn't work with current layer styles setup
			// if (layer.tweens.length) {
			// 	const p = layer.tweens[0].prop;
			// 	if (!['startIndex', 'endIndex'].includes(p)) {
			// 		layer[p] = layer.tweens[0].endValue;
			// 	}
			// }
			
			const prop = choice(...Object.keys(params)); // choose prop

			// change prop or tween
			if (prop === 'startIndex' || prop === 'endIndex') {
				const tween = {
					prop: prop,
					startFrame: 0,
					endFrame: animation.endFrame,
					startValue: 0,
					endValue: animation.drawings[layer.drawingIndex].length - 1,
				};
				layer.tweens.push(tween);
			}
			else if (chance(0.5)) { // change prop
				// layer[prop] = Cool.randomInt(this.params[prop][0], this.params[prop][1]);
				const val = randomInt(...params[prop]);
				animation.overrideProperty(prop, val);
			} else { //  add tweens
				const tween = { prop: prop };
				tween.startFrame = 0;
				tween.endFrame = animation.endFrame;
				
				tween.startValue = props[prop];
				tween.endValue = randomInt(...params[prop]);
				
				layer.tweens.push(tween);
				animTweens.push(tween);
			}
			// console.log('tweens', i, JSON.stringify(layer.tweens));
		}
	}

	function clear() {
		animation.layers.forEach(l => { l.tweens = []; });
		animation.cancelOverride();
	}

	return { set, clear };
}
