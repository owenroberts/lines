class UIDragButton extends UIButton {
	constructor(params) {
		super(params);

		this.down = { x: 0, y: 0 };

		this.el.addEventListener('mousemove', ev => {
			if (this.down.x) this.dragging = true;
		});

		this.el.addEventListener('mousedown', ev => {
			this.down.x = ev.pageX;
		});

		document.addEventListener('mouseup', ev => {
			// console.log(ev);
			if (this.dragging) {
				const delta = ev.pageX - this.down.x;
				if (Math.abs(delta) > 10) {
					this.callback(delta > 0 ? 1 : -1, Math.abs(Math.ceil(delta / lns.ui.timeline.frameSize
)));
				}
			}
			this.dragging = false;
			this.down.x = 0;
		});
	}f
}