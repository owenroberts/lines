class UIClip extends UICollection {
	constructor(clip, params) {
		super(params);

		const label = new UILabel({ text: clip.name });

		const visibilityToggle = new UIToggleCheck({
			isOn: clip.isVisible,
			callback: (isOn) => {
				clip.isVisible = isOn !== undefined ? isOn : !clip.isVisible;
			}
		});

		const edit = new UIButton({
			text: 'E',
			callback: () => {
				let locationURL = location.pathname.includes('lines') ? 'lines/' : '';
				window.open(`${location.origin}/${locationURL}animate/?src=${clip.filePath}`, 'anim');
			}
		});

		const remove = new UIButton({
			text: "X",
			callback: params.remove
		});

		const plus = new UIButton({
			text: '+',
			callback: params.addClip
		});

		const repeat = new UINumberStep({
			value: clip.repeatCount,
			callback: (value) => {
				clip.repeatCount = +value;
				params.drawUI();
			}
		});

		const stateSelector = new UISelect({
			options: Object.keys(clip.animation.states),
			selected: clip.state,
			callback: (value) => {
				clip.state = value;
				clip.setup();
				params.drawUI();
			}
		});

		const swap = new UIButton({
			text: '⮂',
			callback: params.swap
		});

		const dpf = new UINumberStep({
			value: clip.dpf,
			callback: (value) => {
				clip.dpf = +value;
				params.drawUI();
			}
		});

		let top = new UIRow();
		let mid = new UIRow();
		let bot = new UIRow();

		this.append(top);
		this.append(mid);
		this.append(bot);

		top.append(label);
		mid.append(swap);
		mid.append(stateSelector);
		mid.append(plus);
		
		top.append(visibilityToggle);
		
		top.append(remove);
		top.append(edit);

		bot.append(new UILabel({ text: 'R' }));
		bot.append(repeat);
		bot.append(new UILabel({ text: 'DPF' }));
		bot.append(dpf);
		
	}
}