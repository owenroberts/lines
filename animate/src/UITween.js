class UITween extends UICollection {
	constructor(params, tween, layer) {
		super(params);
		this.addClass('tween');
		this.tween = tween;

		const edit = new UIButton({
			text: 'E',
			btnClass: 'timeline-btn',
			class: 'tween-edit',
			callback: () => {
				const modal = new UIModal({
					title: 'Edit Tween', 
					app: lns, 
					position: this.position, 
					callback: () => { params.update(); }
				});	

				const uis = this.getPropUIs(tween, layer, params, true);

				modal.addBreak('Start Frame');
				modal.add(uis.startFrame);
				modal.addBreak('End Frame');
				modal.add(uis.endFrame);
				modal.addBreak('Start Value');
				modal.add(uis.startValue);
				modal.addBreak('End Value');
				modal.add(uis.endValue);
			}
		});

		const remove = new UIButton({
			class: 'remove',
			text: 'X',
			btnClass: 'timeline-btn',
			callback: () => {
				layer.tweens.splice(layer.tweens.indexOf(this), 1);
				lns.ui.update();
			}
		});

		const uis = this.getPropUIs(tween, layer, params, false);
		uis.endFrame.addClass('right-margin');

		this.append(uis.startFrame);
		this.append(edit);
		this.append(remove);
		this.append(uis.endFrame);

	}

	getPropUIs(tween, layer, params, isModal) {

		const btnClass = isModal ? 'btn' : 'timeline-btn';

		const startFrame = new UINumberStep({
			value: tween.startFrame,
			class: isModal ? '' : btnClass,
			callback: value => {
				tween.startFrame = value >= layer.startFrame ?
					value :
					layer.startFrame;
				params.update();
			}
		});

		const endFrame = new UINumberStep({
			value: tween.endFrame,
			class: isModal ? '' : btnClass,
			callback: value => {
				tween.endFrame = value <= layer.endFrame ?
					value :
					layer.endFrame;
				params.update();
			}
		});

		const startValue = new UINumberStep({
			value: tween.startValue,
			class: isModal ? '' : btnClass,
			callback(value) {
				tween.startValue = value;
			}
		});

		const endValue = new UINumberStep({
			value: tween.endValue,
			class: isModal ? '' : btnClass,
			callback(value) {
				tween.endValue = value;
			}
		});	

		return { startFrame, endFrame, startValue, endValue };
	}

}