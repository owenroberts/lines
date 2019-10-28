class UIAnimation extends UICollection {
	constructor(anim) {
		super({});
		this.el.classList.add('anim');
		this.anim = anim;
		

		this.label = new UILabel({
			text: anim.prop
		});
		this.label.addClass('anim');

		this.left = new UIDragButton({
			text: '+',
			type: 'left',
			callback: (dir, num) => {
				anim.sf += (dir ? dir : -1) * (num ? num : 1);
				this.update();
			}		
		});

		this.right = new UIDragButton({
			text: '+',
			type: 'right',
			callback: (dir, num) => {
				this.anim.ef += (dir ? dir : 1) * (num ? num : 1);
				this.update();
			}		
		});

		this.update();
	}

	get elems() {
		return [this.left.el, this.label.el, this.right.el];
	}

	update() {

		this.left.el.style['grid-column'] = `${this.anim.sf + 1} / span 1`;
		this.label.el.style['grid-column'] = `${this.anim.sf + 2} / span ${this.anim.ef - this.anim.sf + 1}`;
	}
}