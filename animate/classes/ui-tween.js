class UITween extends UICollection {
	constructor(tween) {
		super({});
		this.el.classList.add('tween');
		this.tween = tween;
		

		this.label = new UILabel({
			text: tween.prop
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

	get elems() {
		return [this.left.el, this.label.el, this.right.el];
	}

	update() {
		this.left.el.style['grid-column'] = `${this.tween.sf + 1} / span 1`;
		this.label.el.style['grid-column'] = `${this.tween.sf + 2} / span ${this.tween.ef - this.tween.sf + 1}`;
	}
}