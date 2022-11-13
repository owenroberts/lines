class UIClip extends UICollection {
	constructor(params) {
		super(params);
		if (!params.state) this.setState();
		this.state = params.state || 'default';
		this.repeat = params.repeat || 1;
		this.addClass('clip');

		this.label = new UILabel({ text: 'State ' + this.state });

		const repeat = new UINumberStep({
			label: 'Repeat',
			value: this.repeat,
			callback: value => { this.repeat = value; }
		});

		this.add(this.label);
		const row = new UIRow();
		this.add(row);

		const change = new UIButton({
			text: 'Change State',
			callback: () => { this.setState() },
		});

		row.add(change);

		row.add(new UILabel({ text: 'Repeat' }));
		row.add(repeat);

		const remove = new UIButton({
			text: 'X',
			callback: () => { params.remove() },
		});

		row.add(remove);

		// edit button to return timeline
		// swap button if its useful
		
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
				this.label.text = 'State ' + this.state;
			}
		});

		const selector = new UISelect({
			options: Object.keys(lns.anim.states),
			value: state,
			callback: value => { state = value; }
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
		};
	}
}