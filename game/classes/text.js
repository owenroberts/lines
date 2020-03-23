class Text {
	constructor(x, y, msg, wrap, letters) {
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.msg = msg;
		this.wrap = wrap;
		this.active = true;
		this.letters = letters;
		this.breaks = [];
		this.setBreaks();
		this.count = 0;
		this.end = 0;
	}

	setPosition(x, y) {
		this.x = x;
		this.y = y;
	}
	
	setMsg(msg) {
		this.msg = msg;
		this.setBreaks();
	}

	setBreaks() {
		let nextSpace = false;
		let offset = 0;
		this.breaks = [];
		for (let i = 0; i < this.msg.length; i++) {
			if (i != 0) {
				if (i % this.wrap  == offset && this.msg[i] == ' ' && !nextSpace) {
					this.breaks.push(i);
				} else if (i % this.wrap == offset && this.msg[i] != ' ' && !nextSpace) {
					nextSpace = true;
				} else if (nextSpace && this.msg[i] == ' ') {
					this.breaks.push(i);
					offset = i % this.wrap;
					nextSpace = false;
				}
			}
		}
	}
	
	/* animate text backward and forward, maybe need to update - maybe add animate/update method? */
	display(countForward, countBackward, _x, _y) {
		const len = countForward ? this.count : this.msg.length;
		const index = countBackward ? this.end : 0;
		if (this.active) {
			let x = _x || this.x;
			let y = _y || this.y;
			y -= this.breaks.length * 35;
			for (let i = index; i < len; i++) {
				var letter = this.msg[i];
				if (letter == ' ' || letter == '_') {
					x += 30;
				} else {
					this.letters.state = letter;
					this.letters.draw(x, y);
					x += 18;
				}
				if (this.breaks.indexOf(i) != -1) {
					y += 35;
					x = _x || this.x;
				}
			}
		}
		if (this.count >= this.msg.length) this.end++;
		else this.count++;
		if (countBackward) {
			if (this.end >= this.msg.length) {
				this.end = 0; /* reset */
				this.count = 0;
				return true;
			}
		} else {
			if (this.end >= 5) { // how long to wait after completed text // hardcoded?
				this.end = 0;
				this.count = 0;
				return true; // ended
			}
		}
	}

	isOver(x, y) {
		if (x > this.x && x < this.x + (this.wrap < this.msg ? this.wrap : this.msg.length) * this.letters.width &&
			y > this.y && y < this.y + (this.breaks.length + 1) * this.letters.height) {
			return true;
		} else {
			return false;
		}
	}
}

