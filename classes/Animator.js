/*
	animation params
*/

class Animator {

	constructor(animation, params_) {
		this.animation = animation;
		this.params = {
			// min max, randomize
			segmentNum: [1, 5],
			jiggleRange: [0, 9],
			wiggleRange: [0, 10],
			wiggleSpeed: [0, 4],
			linesInterval: [1, 10],
			startIndex: [0, 'end'],
			endIndex: [0, 'end'],
			...params_
		};
	}

	update() {
		this.animation.layers.forEach(layer => {

			// set tween end props to current layer props
			if (layer.tweens.length) {
				const p = layer.tweens[0].prop;
				if (!['startIndex', 'endIndex'].includes(p)) {
					layer[p] = layer.tweens[0].endValue;
				}
			}
			
			layer.tweens = []; // remove old tweens
			const prop = Cool.choice(...Object.keys(this.params)); // choose prop

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
			else if (Cool.chance(0.5)) { // change prop
				layer[prop] = Cool.randomInt(this.params[prop][0], this.params[prop][1]);
			} else { //  add tweens
				const tween = { prop: prop };
				tween.startFrame = 0;
				tween.endFrame = this.animation.endFrame;
				
				tween.startValue = layer[prop];
				tween.endValue = Cool.randomInt(this.params[prop][0], this.params[prop][1]);
				
				layer.tweens.push(tween);
			}
				
		});
	}
}