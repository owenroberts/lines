/*
	Sprite -> UI -> TextButton
	a ui sprite that has text to render instead of animation
*/

class TextButton extends UI {
	constructor(x, y, msg, wrap, letters) {
		super({x: x, y: y});
		this.center = false;
		this.text = new Text(this.position.x, this.position.y, msg, wrap, letters);
		this.setCollider();
	}

	setMsg(msg) {
		this.text.setMsg(msg);
		this.text.wrap = msg.length;
		this.setCollider();
	}

	setCollider() {
		this.size.x = this.collider.size.x = (this.text.wrap < this.text.msg.length ? this.text.wrap : this.text.msg.length) * this.text.track;
		this.size.y = this.collider.size.y = (this.text.breaks.length + 1) * this.text.letters.height;
	}

	display() {
		super.display();
		if (this.isActive) this.text.display();
	}

	setPosition(x, y) {
		this.position.x = x;
		this.position.y = y;
		this.text.setPosition(x, y);
	}
}