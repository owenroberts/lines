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
 * animator - create a bunch of randomized keyframes and add to anim layers
 */
export class Animator {
	
	/**
	 * creates an animator
	 * @param {Anim} 			- anim
 	 * @param {object} params	- params to overwrite defaults
 	 * @param {string[]} ignore	- list of props to ignore
	 */
	constructor(anim, params={}, ignore=[]) {

		this.anim = anim;
		this.params = {};

		for (const k in defaultParams) {
			if (!this.params.hasOwnProperty(k) && !ignore.includes(k)) {
				this.params[k] = defaultParams[k];
			}
		}
	}

	/**
	 * set new keyframes
	 */
	set() {
		this.clear();

		for (let i = 0; i < this.anim.layers.length; i++) {
			const layer = this.anim.layers[i];

			const props = { 
				...layer.getProps(), 
				...this.anim.styles[layer.styleIndex], 
			};
			
			const prop = choice(...Object.keys(this.params)); // choose prop
			const keyframe = { prop, isAnimatorKeyframe: true };

			if (prop === 'startIndex' || prop === 'endIndex') {
				keyframe.frames = [
					[0, 0], 
					[this.anim.endFrame, this.anim.drawings[layer.drawingIndex].length - 1]
				];
			} else if (chance(0.5)) { // change prop
				keyframe.frames = [[0, randomInt(...this.params[prop])]];
			} else {
				keyframe.frames = [
					[0, props[prop]],
					[this.anim.endFrame, randomInt(...this.params[prop])],
				];
			}
			layer.keyframes.push(keyframe);
		}
	}

	/**
	 * clear anim keyframes
	 */
	clear() {
		for (let i = 0; i < this.anim.layers.length; i++) {
			const layer = this.anim.layers[i];

			// remove prev keyframes
			for (let j = layer.keyframes.length - 1; j >= 0; j--) {
				if (layer.keyframes[j].isAnimatorKeyframe) {
					layer.keyframes.splice(j, 1);
				}
			}
		}
	}
}
