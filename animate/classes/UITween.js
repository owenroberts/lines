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

				modal.add(new UILabel({ text: 'Start Frame:' }));
				modal.add(new UIBlur({
					value: tween.sf,
					callback: function(value) {
						tween.sf = +value;
					}
				}));

				modal.add(new UILabel({ text: 'End Frame:' }));
				modal.add(new UIBlur({
					value: tween.ef,
					callback: function(value) {
						tween.ef = +value;
					}
				}));

				modal.add(new UILabel({ text: 'Start Value:' }));
				modal.add(new UIBlur({
					value: tween.sv,
					callback: function(value) {
						tween.sv = +value;
					}
				}));

				modal.add(new UILabel({ text: 'End Value:' }));
				modal.add(new UIBlur({
					value: tween.ev,
					callback: function(value) {
						tween.ev = +value;
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