import { Elements } from '../../../ui/src/UI.js';
const { UICollection, UIModal, UILabel, UINumberStep, UIButton, UISelect, UIRow } = Elements;

export class UIClip extends UICollection {
	constructor(params) {
		super(params);
		
		this.addClass('clip');
		this.update = params.update;

		this.state = params.state ?? 'default';
		this.repeat = params.repeat ?? 1;
		this.dir = params.dir ?? 1;

		this.label = this.add(new UILabel({ text: this.state }));
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

		if (!params.state) this.setState();
	}

	setState() {
		let state = this.state;
		const m = new UIModal({
			title: 'Set State',
			app: lns,
			position: this.position || lns.mousePosition,
			callback: () => {
				if (!state) return;
				this.state = state;
				this.label.text = this.state;
				this.update();
			}
		});

		const selector = new UISelect({
			options: Object.keys(lns.anim.states),
			value: state,
			callback: value => { 
				state = value;
				this.update();
			}
		});
		m.add(selector);
	}

	get duration() {
		return (lns.anim.states[this.state].end - lns.anim.states[this.state].start + 1) * this.repeat;
	}

	getFrame(frame) {
		const duration = lns.anim.states[this.state].end - lns.anim.states[this.state].start + 1;
		return lns.anim.states[this.state].start + frame % duration;
	}

	getData() {
		return {
			state: this.state,
			repeat: this.repeat,
			dir: this.dir,
			count: 0,
		};
	}
}