/*
	Sprite -> UI -> TextButton
	a ui sprite that has text to render instead of animation
*/

import { UI } from './ui.js';

export class TextButton extends UI {
	constructor(params) {
		super(params);
		// this.center = params.center || false;
		this.text = new TextSprite(params);
		if (params.center) this.text.center();
		this.setCollider();
	}

	setMessage(message) {
		this.text.setMessage(message);
		this.text.wrap = message.length;
		this.setCollider();
	}

	setCollider() {
		this.collider[0] = this.center ? -this.text.width / 2 : 0;
		this.collider[1] = this.center ? -this.text.height / 2 : 0;
		this.collider[2] = (this.text.wrap < this.text.message.length ? this.text.wrap : this.text.message.length + 1) * this.text.track;
		this.collider[3] = (this.text.breaks.length + 1) * this.text.letters.height;
	}

	draw() {
		super.draw();
		if (this.isActive) this.text.draw();
	}

	setPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
		this.text.setPosition(x, y);
	}
}