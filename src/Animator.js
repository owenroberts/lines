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
 */
export class Animator {
	
	/**
	 * creates an animator
	 * @param {LinesAnimation} 		- animation
 	 * @param {object} params    	- params to overwrite defaults
 	 * @param {string[]} ignore 	- list of params to ignore making tweens
	 */
	constructor(animation, params={}, ignore=[]) {

		this.animation = animation;
		this.animTweens = [];
		this.params = {};

		for (const k in defaultParams) {
			if (!this.params.hasOwnProperty(k) && !ignore.includes(k)) {
				this.params[k] = defaultParams[k];
			}
		}
	}

	/**
	 * set new tweens
	 */
	set() {
		this.clear();

		for (let i = 0; i < this.animation.layers.length; i++) {
			const layer = this.animation.layers[i];

			const props = { 
				...layer.getProps(), 
				...this.animation.styles[layer.styleIndex].getProps(), 
			};
			
			const prop = choice(...Object.keys(this.params)); // choose prop

			// change prop or tween
			if (prop === 'startIndex' || prop === 'endIndex') {
				const tween = {
					prop: prop,
					startFrame: 0,
					endFrame: this.animation.endFrame,
					startValue: 0,
					endValue: this.animation.drawings[layer.drawingIndex].length - 1,
				};
				layer.tweens.push(tween);
			}
			else if (chance(0.5)) { // change prop
				// layer[prop] = Cool.randomInt(this.params[prop][0], this.params[prop][1]);
				const val = randomInt(...this.params[prop]);
				this.animation.overrideProperty(prop, val);
			} else { //  add tweens
				const tween = { prop: prop };
				tween.startFrame = 0;
				tween.endFrame = this.animation.endFrame;
				
				tween.startValue = props[prop];
				tween.endValue = randomInt(...this.params[prop]);
				
				layer.tweens.push(tween);
				this.animTweens.push(tween);
			}
			// console.log('tweens', i, JSON.stringify(layer.tweens));
		}
	}

	/**
	 * clear anim tweens
	 */
	clear() {
		for (let i = 0; i < this.animation.layers.length; i++) {
			const layer = this.animation.layers[i];

			// remove prev tweens
			for (let j = layer.tweens.length - 1; j >= 0; j--) {
				if (this.animTweens.includes(layer.tweens[j])) {
					layer.tweens.splice(j, 1);
				}
			}
		}

		this.animTweens = [];
	}
}
