class UITween extends UICollection {
	constructor(params, tween, layer) {
		super(params);
		this.addClass('tween');
		this.tween = tween;

		this.edit = new UIButton({
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

				/* not DRY maybe make an animate class tween-modal */

				modal.addBreak('Start Frame:');
				modal.add(new UINumber({
					value: tween.startFrame,
					callback(value) {
						tween.startFrame = +value;
					}
				}));

				modal.addBreak('End Frame:');
				modal.add(new UINumber({
					value: tween.endFrame,
					callback(value) { tween.endFrame = value; }
				}));

				modal.addBreak('Start Value:');
				modal.add(new UINumber({
					value: tween.startValue,
					callback: function(value) {
						tween.startValue = +value;
					}
				}));

				modal.addBreak('End Value:');
				modal.add(new UINumber({
					value: tween.endValue,
					callback: function(value) {
						tween.endValue = +value;
					}
				}));
			}
		});

		this.remove = new UIButton({
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
		this.append(this.edit);
		this.append(this.remove);
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

		return { startFrame, endFrame };
	}

	get html() {
		return this.el;
	}

}