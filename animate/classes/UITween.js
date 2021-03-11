class UITween extends UICollection {
	constructor(params, tween, layer) {
		super(params);
		this.addClass('tween');
		this.tween = tween;

		this.edit = new UIButton({
			text: '✎',
			type: 'tween-edit',
			callback: () => {
				const modal = new UIModal('Edit Tween', lns, this.position, function() {
					lns.ui.update();
				});	

				/* not DRY maybe make an animate class tween-modal */

				modal.addBreak('Start Frame:');
				modal.add(new UIBlur({
					value: tween.startFrame,
					callback: function(value) {
						tween.startFrame = +value;
					}
				}));

				modal.addBreak('End Frame:');
				modal.add(new UIBlur({
					value: tween.endFrame,
					callback: function(value) {
						tween.endFrame = +value;
					}
				}));

				modal.addBreak('End Frame:');
				modal.add(new UIBlur({
					value: tween.startValue,
					callback: function(value) {
						tween.startValue = +value;
					}
				}));

				modal.addBreak('End Value:');
				modal.add(new UIBlur({
					value: tween.endValue,
					callback: function(value) {
						tween.endValue = +value;
					}
				}));
			}
		});

		this.left = new UIDragButton({
			text: '⬗',
			type: 'left',
			callback: (dir, num) => {
				tween.sf += (dir ? dir : -1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.right = new UIDragButton({
			text: '⬖',
			type: 'right',
			callback: (dir, num) => {
				this.tween.ef += (dir ? dir : 1) * (num ? num : 1);
				lns.ui.update();
			}		
		});

		this.remove = new UIButton({
			type: 'remove',
			text: '🗑',
			callback: () => {
				layer.tweens.splice(layer.tweens.indexOf(this), 1);
				lns.ui.update();
			}
		});

		this.append(this.edit);
		this.append(this.remove);
		this.append(this.left);
		this.append(this.right);
	}

	get html() {
		return this.el;
	}

}