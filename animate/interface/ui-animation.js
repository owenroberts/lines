class UIAnimation extends UICollection {
	constructor(index, anim) {
		super({});
		// console.log(this);
		this.el.classList.add('anim');
		this.anim = anim;
		this.el.style.gridColumnStart = anim.sf + 1;
		this.el.style.gridColumnEnd = anim.ef + 2;
		this.el.style.gridRow = index + 1;

		this.label = new UILabel({
			type: 'anim',
			text: `anim`
		});

		this.left = new UIDragButton({
			text: '+',
			type: 'left',
			callback: (dir, num) => {
				anim.sf += (dir ? dir : -1) * (num ? num : 1);
				this.update();
			}		
		});
		this.append(this.left);
		this.append(this.labels);

		this.right = new UIDragButton({
			text: '+',
			type: 'right',
			callback: (dir, num) => {
				anim.ef += (dir ? dir : 1) * (num ? num : 1);
				this.update();
			}		
		});
		this.append(this.right);

		console.log(this);
	}

	get elems() {
		return this.el;
	}

	update() {
		this.el.style.gridColumnStart = this.anim.sf + 1;
		this.el.style.gridColumnEnd = this.anim.ef + 2;
	}
}