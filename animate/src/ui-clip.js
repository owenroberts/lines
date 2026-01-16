import { UICollection, UIModal, UILabel, UINumberStep, UIButton, UISelect, UIRow } from '../../../oi/src/oi.js';

export class UIClip extends UICollection {
	constructor(params) {
		super(params);
		
		this.addClass('clip');
		this.update = params.update;

		this.clipName = params.clipName ?? 'default';
		this.repeat = params.repeat ?? 1;
		this.dir = params.dir ?? 1;

		this.label = this.add(new UILabel({ text: this.clipName }));
		this.add(new UIButton({
			text: 'Change',
			callback: () => { 
				this.setState();
				this.update();
			},
		}));

		// repeat
		this.add(new UINumberStep({
			value: this.repeat,
			callback: value => { 
				this.repeat = value;
				this.update();
			}
		}));

		// dir override
		this.add(new UISelect({
			value: this.dir,
			options: [-1, 1],
			callback: value => { 
				this.dir = +value;
				this.update();
			}
		}))

		// remove
		this.add(new UIButton({
			text: 'X',
			callback: () => { 
				params.remove();
				this.update();
			},
		}));

		// edit button to return timeline
		// swap button if its useful

		if (!params.clip) this.setState();
	}

	setState() {
		let clipName = this.clipName;
		const m = new UIModal({
			title: 'Set State',
			app: lns,
			position: this.position || lns.mousePosition,
			callback: () => {
				if (!clipName) return;
				this.clipName = clipName;
				this.label.setText(this.clipName);
				this.update();
			}
		});

		const selector = new UISelect({
			options: this.anim.clips.names,
			value: clipName,
			callback: value => { 
				clipName = value;
				this.update();
			}
		});
		m.add(selector);
	}

	get duration() {
		return (lns.anim.clips[this.clipName].end - lns.anim.clips[this.clipName].start + 1) * this.repeat;
	}

	getFrame(frame) {
		const duration = lns.anim.clips[this.clipName].end - lns.anim.clips[this.clipName].start + 1;
		return lns.anim.clips[this.clipName].start + frame % duration;
	}

	getData() {
		return {
			clipName: this.clipName,
			repeat: this.repeat,
			dir: this.dir,
			count: 0,
		};
	}
}