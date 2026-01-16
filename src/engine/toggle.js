/*
	Sprite -> UI -> Button -> Toggle
	button with added isToggled state
*/

import { Button } from './button.js';

export class Toggle extends Button {
	constructor(params, isDebug) {
		super(params, isDebug);
		this.isToggled = false;
	}

	toggle(state, callFuncs=true) {
		if (!state) this.isToggled = !this.isToggled;
		else this.isToggled = state == 'on' ? true : false;
		this.animation.state = this.isToggled ? 'selected' : 'idle';
		
		this.waitToGoOut = false;
		this.mouseOver = false;
		this.clickStarted = false;

		if (callFuncs) {
			if (this.func) this.func(this.isToggled);
			if (this.onClick) this.onClick(this.isToggled);
		}
	}

	out(x, y) {
		super.out(x, y);
		this.animation.state = this.isToggled ? 'selected' : 'idle';
	}
	
	up(x, y) {
		super.up();
		if (this.tap(x,y) && this.clickStarted) this.toggle();
	}
}