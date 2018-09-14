class Text {
	constructor(x, y, msg, wrap, letters) {
		this.x = x;
		this.y = y;
		this.msg = msg;
		this.wrap = wrap;
		this.active = true;
		this.letters = letters;
		this.breaks = [];
		this.setBreaks();
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
	
	display(len, _x, _y) {
		if (len === undefined)
			len = this.msg.length;
		if (this.active) {
			let x = _x || this.x;
			let y = _y || this.y;
			y -= this.breaks.length * 35;

			for (let i = 0; i < len; i++) {
				var letter = this.msg[i];
				if (letter == ' ') {
					x += 30;
				} else {
					this.letters.setState(letter);
					this.letters.draw(x, y);
					x += 18;
				}
				if (this.breaks.indexOf(i) != -1) {
					y += 35;
					x = _x || this.x;
				}
			}
		}
	}
}

