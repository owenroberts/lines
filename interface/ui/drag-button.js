class UIDragButton extends UIButton {
	constructor(params) {
		super(params);

		this.el.addEventListener('mousemove', ev => {
			console.log(ev);
			if (ev.clientX < 8) this.left = true;
			else this.left = false;
			// if (ev.clientX > ev.target.offsetWidth - 4) this.right = true;
			// else this.right = false;

		});

		this.el.addEventListener('mousedown', ev => {
			if (this.left || this.right) 
				this.dragging = true;
		});

		/* mouse leave doesn't work, mouse up not focused anymore
			is this crazy ? */
		document.addEventListener('mouseup', ev => {
			this.dragging = false;

			// console.log('dragging', this.dragging, this.left, this.right);
		});
	}f
}