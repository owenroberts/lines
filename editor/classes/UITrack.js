class UITrack extends UICollection {
	constructor(track, params) {
		super(params);
		console.log(track);

		const label = new UIText({
			text: track.label || 'Track ' + params.index,
			callback: (value) => {
				track.label = value;
			}
		});

		const visibilityToggle = new UIToggleCheck({
			isOn: track.isVisible,
			callback: (isOn) => {
				track.isVisible = isOn !== undefined ? isOn : !track.isVisible;
			}
		});

		this.append(label);
		this.append(visibilityToggle);
	}
}