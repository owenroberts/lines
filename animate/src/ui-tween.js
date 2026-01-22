import { UICollection, UIButton, UINumberStep, UIModal } from '../../../oi/src/oi.js';

export class UITween extends UICollection {
	constructor(params, tween, layer) {
		super(params);
		this.addClass('tween');
		this.tween = tween;

		const edit = new UIButton({
			text: 'E',
			buttonClass: 'timeline-btn',
			class: 'tween-edit',
			callback: () => {

				const modal = new UIModal({
					title: "edit tween",
					ui: params.ui,
					callback: () => { params.update(); }
				});	

				const uis = this.getPropUIs(tween, layer, params, true);

				for (const k in uis) {
					modal.addBreak(k);
					modal.add(uis[k]);	
				}
			}
		});

		const remove = new UIButton({
			class: 'remove',
			text: 'X',
			buttonClass: 'timeline-btn',
			callback: () => {
				layer.tweens.splice(layer.tweens.indexOf(this), 1);
				params.ui.update();
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

		const buttonClass = isModal ? 'btn' : 'timeline-btn';

		const startFrame = new UINumberStep({
			value: tween.startFrame,
			class: isModal ? '' : buttonClass,
			callback: value => {
				tween.startFrame = value >= layer.startFrame ?
					value :
					layer.startFrame;
				params.update();
			}
		});

		const endFrame = new UINumberStep({
			value: tween.endFrame,
			class: isModal ? '' : buttonClass,
			callback: value => {
				tween.endFrame = value <= layer.endFrame ?
					value :
					layer.endFrame;
				params.update();
			}
		});

		const startValue = new UINumberStep({
			obj: tween,
			ref: "startValue",
			class: isModal ? '' : buttonClass,
		});

		const endValue = new UINumberStep({
			obj: tween,
			ref: "endValue",
			class: isModal ? '' : buttonClass,
		});	

		return { startFrame, endFrame, startValue, endValue };
	}

}