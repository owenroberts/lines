/*
	draws text with lettering based on game text string
	handled by game so that each new text object doesn't have to add all the letters...
	maybe just check first?
*/

class Text {
	constructor(x, y, msg, wrap, letters, letterIndexString) { // params?
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
		this.endCount = 1;
		this.endDelay = GAME.dps || 10;
		this.hover = false;
		this.clickStarted = false;

		if (!letters.states[0]) {
			const indexString = letterIndexString || 
				"0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ.,:?-+'&$;\"!";
			for (let i = 0; i < indexString.length; i++) {
				letters.createNewState(indexString[i], i, i);
			}
		}
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
		/* 
			set line breaks in message, 
			based on message length, new line & return keys
			waits for a space i guess?
		*/

		let breakOnNextSpace = false; // wait for next space character
		let offset = 0; // 0 matches first i % this.wrap, then moves to accomodate added characters for spaces
		let prevBreak = false; // for space break followed by \n\r
		this.breaks = [];

		for (let i = 1; i < this.msg.length; i++) {
			prevBreak = false;

			// break on \n\r, check to make sure it didn't just break
			if (this.msg[i].match(/[\n\r]/g) && !prevBreak) {
				this.breaks.push(i);
				offset = i % this.wrap;
				breakOnNextSpace = false;
			}

			else if (i % this.wrap == offset && !breakOnNextSpace) {
				if (this.msg[i] == ' ') {
					this.breaks.push(i);
					prevBreak = true;
				}
				else breakOnNextSpace = true;
			}

			else if (this.msg[i] == ' ' && breakOnNextSpace) {
				this.breaks.push(i);
				offset = i % this.wrap;
				breakOnNextSpace = false;
				prevBreak = true;
			}
		}
	}
	
	/* animate text backward and forward, maybe need to update - maybe add animate/update method? */
	display(countForward, countBackward, _x, _y) {
		if (this.isActive) {
			const len = countForward ? Math.floor(this.count) : this.msg.length;
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
					// y += this.lead;
					// x = _x || this.x;
				} else {
					this.letters.state = letter;
					// only do a line update when its the first instance of letter in message
					this.letters.draw(x, y);
					x += this.track;
				}
				if (this.breaks.indexOf(i) != -1) {
					y += this.lead;
					x = _x || this.x;
				}
			}
			
			// console.log(this.count, this.msg.length, this.end);
			if (this.count >= this.msg.length) this.end++;
			else this.count += this.endCount;
			if (countBackward) {
				if (this.end >= this.msg.length) {
					this.end = 0; /* reset */
					this.count = 0;
					return true;
				}
			} else {
				if (this.end >= this.endDelay) { // how long to wait after completed text // hardcoded?
					this.end = 0;
					this.count = 0;
					return true; // ended
				}
			}
		}
	}
}

