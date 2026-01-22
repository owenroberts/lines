import { UICollection, UIModal, UILabel, UINumberStep, UIButton, UISelect, UIRow } from '../../../oi/src/oi.js';

export class UIClip extends UICollection {
	constructor(params) {
		super(params);
		this.addClass('clip');

		this.ui = params.ui;
		this.anim = params.anim;
		this.clip = params.clip;

		this.label = this.add(new UILabel({ text: this.clip.name }));
		this.add(new UIButton({
			text: 'set',
			callback: () => {
				let clipName = this.clipName;
				const m = new UIModal({
					title: "set clip",
					ui: this.ui,
					callback: () => {
						if (!clipName) return;
						this.clipName = clipName;
						this.label.setText(this.clipName);
					}
				});

				m.add(new UISelect({
					options: this.anim.clips.names,
					value: clipName,
					callback: value => { 
						clipName = value;
					}
				}));
			},
		}));

		// repeat
		this.add(new UINumberStep({
			obj: this.clip,
			ref: "repeat",
		}));

		// dir override
		this.add(new UISelect({
			obj: this.clip,
			ref: "dir",
			options: [-1, 1],
		}))

		// remove
		this.add(new UIButton({
			text: 'X',
			callback: () => { 
				params.remove();
			},
		}));
	}
}