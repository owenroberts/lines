class UITween extends UICollection {
	constructor(tween) {
		super({});
		this.el.classList.add('tween');
		this.tween = tween;

		this.label = new UIButton({
			text: tween.prop,
			callback: () => {
				const modal = new UIModal('Edit Tween', lns, this.label.position, function() {
					lns.ui.layers.update();
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
						console.log(tween);
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
		this.label.addClass('tween');

		this.left = new UIDragButton({
			text: '+',
			type: 'left',
			callback: (dir, num) => {
				tween.sf += (dir ? dir : -1) * (num ? num : 1);
				this.update();
			}		
		});

		this.right = new UIDragButton({
			text: '+',
			type: 'right',
			callback: (dir, num) => {
				this.tween.ef += (dir ? dir : 1) * (num ? num : 1);
				this.update();
			}		
		});

		this.update();
	}

	get html() {
		return [this.left.el, this.label.el, this.right.el];
	}

	update() {
		this.left.el.style['grid-column'] = `${this.tween.sf + 1} / span 1`;
		this.label.el.style['grid-column'] = `${this.tween.sf + 2} / span ${this.tween.ef - this.tween.sf + 1}`;
	}
}