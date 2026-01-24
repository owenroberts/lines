import { UICollection, UIButton, UINumberStep, UIModal } from '../../../oi/src/oi.js';
import { UIKeyFrameModal } from './ui-keyframe-modal.js';

export class UIKeyFrameChannel extends UICollection {
	constructor(params) {
		super(params);
		this.addClass("keyframe");

		this.ui = params.ui;
		this.anim = params.anim;
		this.layer = params.layer;
		this.channel = params.channel;

		this.addLabel(this.channel.prop);

		this.add(new UIButton({
			text: 'E',
			buttonClass: 'timeline-button',
			callback: () => {

				const keyFrameModal = new UIKeyFrameModal({
					ui: this.ui,
					anim: this.anim,
					channel: this.channel,
					layer: this.layer,
				});
			}
		}));

		this.add(new UIButton({
			text: 'X',
			buttonClass: 'timeline-button',
			callback: () => {
				this.layer.keyframes.splice(this.layer.keyframes.indexOf(this.channel), 1);
				this.ui.update();
			}
		}));

		for (let i = 0; i < this.channel.frames.length; i++) {
			const frame = new UINumberStep({
				value: this.channel.frames[i][0],
				class: "timeline-button",
				callback: value => { 
					this.channel.frames[i][0] = value; 
					this.ui.update();
				},
			});
			this.add(frame);

			if (i > 0 && i < this.channel.frames.length - 1) {
				frame.setStyle("margin-left", `calc(${this.channel.frames[i][0]}/${this.anim.endFrame} * 100%)`);
			}
		}
	}
}