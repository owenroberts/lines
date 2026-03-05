import { UIModal, UISelect, UIButton, UINumberStep } from '../../../oi/src/oi.js';
import { createKeyframeChannel, KEYFRAME_PROP_LIST } from '../../src/lines.js';

export class UIKeyFrameModal extends UIModal {
	constructor({ channel, ui, layer, anim }) {
		super({ ui, title: "add keyframe" });

		this.anim = anim;
		this.layer = layer;

		this.channel = channel ?? createKeyframeChannel({
			prop: "endIndex",
			frames: [],
		});

		this.add(new UISelect({
			options: KEYFRAME_PROP_LIST,
			value: "endIndex",
			callback: value => { channel.prop = value; },
		}));

		this.addBreak("frames");

		this.add(new UIButton({
			text: "+",
			callback: () => {
				const index = this.channel.frames.length;
				this.channel.frames.push([this.anim.currentFrame, 0]);
				this.addFrame(index);
			}
		}));

		for (let i = 0; i < this.channel.frames.length; i++) {
			this.addFrame(i);
		}

		this.callback = () => {
			if (!channel) this.layer.keyframes.push(this.channel);
			this.ui.update();
		};
	}

	addFrame(index) {
		this.addBreak("frame");
		this.add(new UINumberStep({
			value: this.channel.frames[index][0],
			callback: value => { this.channel.frames[index][0] = value; },
		}));

		this.addBreak("value");
		const valueInput = this.add(new UINumberStep({
			value: this.channel.frames[index][1],
			callback: value => { this.channel.frames[index][1] = value; },
		}));

		this.add(new UIButton({
			text: "set value to drawing end",
			callback: value => { 
				this.channel.frames[index][1] = this.anim.drawings[this.layer.drawingIndex].length - 1;
				valueInput.update(this.channel.frames[index][1], true);
			},
		}));
	}
}