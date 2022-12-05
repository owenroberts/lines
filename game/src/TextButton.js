/*
	Sprite -> UI -> TextButton
	a ui sprite that has text to render instead of animation
*/

class TextButton extends UI {
	constructor(params) {
		super(params);
		// this.center = params.center || false;
		this.text = new TextSprite(params);
		if (params.center) this.text.center();
		this.setCollider();

	}

	setMsg(msg) {
		this.text.setMsg(msg);
		this.text.wrap = msg.length;
		this.setCollider();
	}

	setCollider() {
		this.collider[0] = this.center ? -this.text.width / 2 : 0;
		this.collider[1] = this.center ? -this.text.height / 2 : 0;
		this.collider[2] = (this.text.wrap < this.text.msg.length ? this.text.wrap : this.text.msg.length + 1) * this.text.track;
		this.collider[3] = (this.text.breaks.length + 1) * this.text.letters.height;
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

LinesEngine.TextButton = TextButton;