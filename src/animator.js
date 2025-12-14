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
	 * @param {Anim} 		- animation
 	 * @param {object} params    	- params to overwrite defaults
 	 * @param {string[]} ignore 	- list of params to ignore making tweens
	 */
	constructor(animation, params={}, ignore=[]) {

		this.animation = animation;
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
					isAnimatorTween: true,
				};
				layer.tweens.push(tween);
			} else if (chance(0.5)) { // change prop
				const val = randomInt(...this.params[prop]);
				this.animation.overrideProperty(prop, val);
			} else { //  add tweens
				const tween = { 
					prop: prop, 
					startFrame: 0,
					endFrame: this.animation.endFrame,
					startValue: props[prop],
					endValue: randomInt(...this.params[prop]),
					isAnimatorTween: true,
				};
				layer.tweens.push(tween);
			}
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
				if (layer.tweens[j].isAnimatorTween) {
					layer.tweens.splice(j, 1);
				}
			}
		}

		this.tweenIndexes = [];
		this.animation.cancelOverride();
	}
}
