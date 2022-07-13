class UINumberStep extends UICollection {
	constructor(params) {
		super(params);
		this.callback = params.callback;
		this.args = params.args;
		this.step = +params.step || 1;
		this.min = +params.min || 0;
		this.max = +params.max || 100;

		// constrain range

		this.addClass('ui-collection');

		this.numberInput = new UINumber({
			...params,
			class: 'middle',
			callback: this.update.bind(this)
		});

		this.stepDown = new UIButton({
			text: '<',
			class: 'left-end',
			callback: () => {
				this.update(this.value - this.step);
			}
		});

		this.stepUp = new UIButton({
			text: '>',
			class: 'right-end',
			callback: () => {
				this.update(this.value + this.step);
			}
		});

		this.append(this.stepDown);
		this.append(this.numberInput);
		this.append(this.stepUp);


		// drag on number input -- blendery
		// better in number.js ? -- no there's no min max or step
		const drag = { 
			x: 0, // position when clicked
			y: 0, 
			lock: 'none', // lock to up/down right/left
			timeout: 8, 
			timer: 0, // timeout so it doesn't go nuts
			prev: 0, // -1 or 1
			active: false,
		}; 
		const self = this;

		function mouseDown(ev) {
			drag.x = ev.pageX;
			drag.y = ev.pageY;
			drag.active = true;
			document.addEventListener('mousemove', mouseMove);
			document.addEventListener('mouseup', mouseUp);
		}

		function mouseMove(ev) {
			if (!drag.active) return;

			const delta = { x: ev.pageX - drag.x, y: ev.pageY - drag.y };
			if (drag.lock === 'none') {
				drag.lock = Math.abs(delta.x) > Math.abs(delta.y) ? 'x' : 'y';
			}

			if (Math.abs(delta[drag.lock]) > 10 && drag.timer === 0) {
				const m = drag.lock === 'x' ? 1 : -1; // multiplier for x/y
				self.update(self.value + self.step * m * Math.sign(delta[drag.lock]));
				drag.timer = drag.timeout;
				drag.x = ev.pageX;
				drag.y = ev.pageY;
			} else if (drag.timer > 0) {
				drag.timer--;
			}
		}

		function mouseUp(ev) {
			if (!drag.active) return;
			drag.active = false;
			drag.x = 0;
			drag.y = 0;
			drag.lock = 'none';
			drag.dir = 0;
			document.removeEventListener('mousemove', mouseMove);
			document.removeEventListener('mouseup', mouseUp);
		}

		this.numberInput.el.addEventListener('mousedown', mouseDown);

		if (params.value !== undefined) {
			this.value = params.value;
		}
	}

	keyHandler(value) {
		// this.update(value !== undefined ? +value : prompt(this.prompt));
		this.update(+prompt(this.prompt));
	}

	update(value, uiOnly) {
		console.log(this.value, value);
		if (value < this.min) {
			this.numberInput.el.placeholder = this.value;
			console.log(this.value, this.numberInput.el.placeholder);
			return;
		}
		if (value > this.max) {
			console.log(this.value);
			this.numberInput.el.placeholder = this.value;
			console.log(this.value, this.numberInput.el.placeholder);
			return;
		}
		if (!uiOnly) {
			if (this.args) this.callback(value, ...this.args);
			else this.callback(value);
		}
		this.value = value;
	}

	get html() {
		return this.el;
	}

	set value(value) {
		this.numberInput.value = +value;
	}

	get value() {
		return this.numberInput.value;
	}
}