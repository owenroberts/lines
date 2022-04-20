
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
		// this.msg = msg;
		this.wrap = wrap;
		this.isActive = true;
		this.letters = letters;
		this.breaks = [];
		// this.setBreaks();
		this.count = 0;
		this.end = 0;
		this.delay = 0;
		
		this.countCount = 0.5;
		this.endCount = 0.5;
		this.endDelay = GAME.dps || 10;

		this.hover = false;
		this.clickStarted = false;

		this.setMsg(msg);

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

	center() {
		this.x -= (this.track * Math.min(this.msg.length, this.wrap)) / 2;
	}
	
	setMsg(msg) {
		this.msg = msg.replace(/\s+$/, ''); // remove trailing spaces
		this.setBreaks();

		// text width is the msg length, or the biggest differece between breaks
		let breakLengths = this.breaks.map((n, i) => i > 0 ? n - this.breaks[i] : n);
		this.width = this.breaks.length <= 0 ?
			this.track * this.msg.length :
			this.track * Math.max(...[0, ...breakLengths]);

		this.height = (this.breaks.length + 1) * this.lead;
		// console.log(msg, this.breaks, this.wrap);
	}

	setBreaks() {
		// console.log(this.msg);
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
				continue;
			}

			if (i % this.wrap === offset && !breakOnNextSpace) {
				// console.log('wrap', i, this.msg[i])
				// check for letters left before space or \n\r
				let halfWrap = Math.round(this.wrap / 2);
				let lettersLeft = this.msg.substring(i, i + halfWrap);
				// console.log('letters left', i, this.msg[i], lettersLeft);
				// if wrap falls on space break
				if (this.msg[i] === ' ') {
					// console.log('break i', i);
					this.breaks.push(i);
					prevBreak = true;
				}

				// if its not going to wrap for a while
				else if (!lettersLeft.match(/[\n\r\s]/g) && lettersLeft.length >= halfWrap) {
					// go backward to previous space (and reset i??)
					for (let j = i - 1; j >= halfWrap; j--) {
						if (this.msg[j] === ' ') {
							// console.log(i, j, this.msg[i], this.msg[j]);
							// console.log('break j', j, 'i', i);
							this.breaks.push(j);
							// need to add offset ?
							// offset = i % this.wrap;
							prevBreak = true;
							break;
						}
					}
				}

				// if not wait til next -- need paramenter here
				else {
					breakOnNextSpace = true;
				}
				continue;
			}

			// if (breakOnNextSpace) console.log('next space', i, this.msg[i]);
			if (this.msg[i] === ' ' && breakOnNextSpace) {
				// console.log('break i', i);
				this.breaks.push(i);
				offset = i % this.wrap;
				breakOnNextSpace = false;
				prevBreak = true;
			}
		}
	}
	
	/* animate text backward and forward, maybe need to update - maybe add animate/update method? */
	/* do i ever use _x, _y ?? */
	display(countForward, countBackward, yAbove) {
		if (!this.isActive) return true;
		const len = countForward ? Math.floor(this.count) : this.msg.length;
		const index = countBackward ? this.end : 0;
		let x = this.x;
		let y = this.y - (yAbove ? (this.breaks.length + 1) * this.lead : 0);
		for (let i = 0; i < len; i++) {
			var letter = this.msg[i];
			if (letter === ' ' || letter === '_' || i < index) {
				x += this.track;
			} else if (letter === '\n' || letter === '\r') {
				// y += this.lead;
				// x = _x || this.x;
				// ? just make this else !== || !== -->
			} else {
				this.letters.state = letter;
				// only do a line update when its the first instance of letter in message
				this.letters.draw(x, y);
				x += this.track;
			}
			if (this.breaks.indexOf(i) !== -1) {
				y += this.lead;
				x = this.x;
			}
		}
		
		// console.log(this.count, this.msg.length, this.end);
		if (this.count < this.msg.length) this.count += this.countCount;
		if (this.count >= this.msg.length) {
			if (this.delay < this.endDelay) this.delay += 1;
			else this.end += this.endCount;
		}
		if (countBackward) {
			// console.log(this.end, this.msg.length)
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

