import { Animator } from '../../src/animator.js';
import { UIPanel, UINumberStep } from '../../../oi/src/oi.js';

/**
 * add randomized tweens
 * anim needs to be longer than 1 frame
 * should have multiple animators?
 */
export class AnimatorPanel extends UIPanel {
	constructor(ui, anim) {
		super({ id: "animator", ui });

		this.anim = anim;
		this.animator = new Animator(anim);

		// show values
		this.addButtons(
			{ obj: this.animator },
			[
				{ 
					ref: "set",
					callback: () => {
						if (anim.endFrame === 0) {
							alert("animator requires more than 1 frame of animation");
						}
					},
				},
				{ ref: "clear", }
			]
		);
		
		this.addBreak();
		this.addUI();
	}

	// i guess for saving/loading animator later?
	addUI() {
		this.addLabel("defaults");
		this.addBreak();
		
		for (const param in this.animator.params) {

			const range = this.animator.params[param];

			this.addLabel(param);
			this.addBreak();
			
			this.add(new UINumberStep({
				text: "min",
				value: range[0],
				callback: n => { range[0] = n; }
			}));

			this.add(new UINumberStep({
				text: "max",
				value: range[1],
				callback: n => { range[1] = n; }
			}));

			this.addBreak();
		}
	}
}