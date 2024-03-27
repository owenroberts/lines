/*
	Sprite -> UI -> Button -> Toggle
	button with added toggled state
*/

class Toggle extends Button {
	constructor(params, debug) {
		super(params, debug);
		this.toggled = false;
	}

	toggle(state, callFuncs=true) {
		if (!state) this.toggled = !this.toggled;
		else this.toggled = state == 'on' ? true : false;
		this.animation.state = this.toggled ? 'selected' : 'idle';
		
		this.waitToGoOut = false;
		this.mouseOver = false;
		this.clickStarted = false;

		if (callFuncs) {
			if (this.func) this.func(this.toggled);
			if (this.onClick) this.onClick(this.toggled);
		}
	}

	out(x, y) {
		super.out(x, y);
		this.animation.state = this.toggled ? 'selected' : 'idle';
	}
	
	up(x, y) {
		super.up();
		if (this.tap(x,y) && this.clickStarted) this.toggle();
	}
}