class UIDragButton extends UIButton {
	constructor(params) {
		super(params);

		this.el.addEventListener('mousemove', ev => {
			// console.log(ev.clientX);
			if (ev.clientX < 8) this.left = true;
			else this.left = false;
			// if (ev.clientX > ev.target.offsetWidth - 4) this.right = true;
			// else this.right = false;

		});

		this.el.addEventListener('mousedown', ev => {
			if (this.left || this.right) 
				this.dragging = true;
		});

		this.el.addEventListener('mouseup', ev => {
			this.dragging = false;
		});
	}
}