class Text {
	constructor(x, y, msg, wrap, letters) {
		this.x = Math.round(x);
		this.y = Math.round(y);
		this.lead = 35; // leading is space between lines
		this.track = 18; // tracking is space between letters
		this.msg = msg;
		this.wrap = wrap;
		this.isActive = true;
		this.letters = letters;
		this.breaks = [];
		this.setBreaks();
		this.count = 0;
		this.end = 0;
		this.hover = false;
		this.clickStarted = false;
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
				if (i % this.wrap == offset && this.msg[i] == ' ' && !nextSpace) {
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
		if (this.isActive) {
			const len = countForward ? this.count : this.msg.length;
			const index = countBackward ? this.end : 0;
			let x = _x || this.x;
			let y = _y || this.y;
			// y -= this.breaks.length * this.lead;
			for (let i = index; i < len; i++) {
				var letter = this.msg[i];
				// if (!letter.match(/[!a-zA-Z]/g)) console.log(letter);
				if (letter == ' ' || letter == '_') {
					x += this.track;
				} else if (letter == '\n' || letter == '\r') {
					y += this.lead;
					x = _x || this.x;
				} else {
					this.letters.state = letter;
					this.letters.draw(x, y);
					x += this.track;
				}
				if (this.breaks.indexOf(i) != -1) {
					y += this.lead;
					x = _x || this.x;
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
	}
}

