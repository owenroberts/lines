class UIClip extends UICollection {
	constructor(clip, params) {
		super(params);

		console.log(clip);

		const label = new UILabel({ text: clip.name });

		const visibilityToggle = new UIToggleCheck({
			isOn: clip.isVisible,
			callback: (isOn) => {
				clip.isVisible = isOn !== undefined ? isOn : !clip.isVisible;
			}
		});

		const edit = new UIButton({
			text: 'Edit',
			callback: () => {
				let locationURL = location.pathname.includes('lines') ? 'lines/' : '';
				window.open(`${location.origin}/${locationURL}animate/?src=${clip.filePath}`, 'anim');
			}
		});

		this.append(label);
		this.append(visibilityToggle);
		this.append(edit);
	}
}