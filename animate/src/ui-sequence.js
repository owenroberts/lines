import { UICollection, UIButton, UIModal, UISelect } from '../../../oi/src/oi.js';
import { UIClip } from './ui-clip.js';
import { createSequenceClip } from '../../src/lines.js';

export class UISequence extends UICollection {
	constructor(params) {
		super(params);
		this.addClass("ui-sequence");

		this.ui = params.ui;
		this.update = params.update;
		this.anim = params.anim;
		this.sequence = params.sequence;

		this.addLabel(`sequence ${this.sequence.name}`);

		this.add(new UIButton({
			text: "X",
			callback: () => {
				params.remove();
			},
		}));

		this.addBreak();

		this.add(new UIButton({
			text: "+",
			callback: () => {
				let clipName = "default";
				const m = new UIModal({
					title: "choose clip",
					ui: this.ui,
					callback: () => {
						this.addClip(clipName);
					},
				});

				m.add(new UISelect({
					options: this.anim.clips.names,
					value: clipName,
					callback: value => { 
						clipName = value;	
					},
				}));
			},
		}));

		this.addBreak();

		for (let i = 0; i < this.sequence.clips.length; i++) {
			this.addClipUI(this.sequence.clips[i]);
		}
	}

	addClip(name) {
		const clip = createSequenceClip({ name });
		this.sequence.clips.push(clip);
		this.addClipUI(clip);
	}

	addClipUI(clip) {
		const clipUI = this.add(new UIClip({
			ui: this.ui,
			anim: this.anim,
			clip,
			remove: () => {
				const index = this.sequence.clips.indexOf(clip);
				this.sequence.clips.splice(index, 1);
				this.remove(clipUI);
			},
		}));
		this.addBreak();
	}

	show() {
		this.setStyle('display', 'flex');
	}

	hide() {
		this.setStyle('display', 'none');
	}
}