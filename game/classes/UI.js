/*
	positions sprites relative to game canvas dimensions
	better name like user interface element? UISprite?
*/

class UI extends ColliderSprite {
	constructor(params, debug) {
		/* xy orientation to game window */
		let x = params.x;
		let y = params.y;

		if (x % 1 !== 0) x = Math.round(GAME.view.width * x); /* decimal / percentage of window */
		if (x < 0) x = Math.round(GAME.view.width + x); /* negative x offset from right side */
		if (y % 1 !== 0) y = Math.round(GAME.view.height * y); /* decimal / percentage of window */
		if (y < 0) y = Math.round(GAME.view.height + y); /* negative y offset from bottom */

		x = Math.round(x);
		y = Math.round(y);

		super(x, y);
		this.debug = debug;
		this.center = params.center !== undefined ? params.center : true;

		if (params.hidden) this.isActive = false; /* hidden prob in garden json ...  */
		if (params.animation) {
			this.addAnimation(params.animation);
			this.animation.isPlaying = true;
		}
		
		if (params.states) {
			this.animation.states = params.states;
			this.animation.state = 'idle';
		}

		if (params.isButton) {
			this.animation.states = {
				idle: { start: 0, end: 0 },
				over: { start: 1, end: 1 },
				down: { start: 2, end: 2 },
			}
			this.onOver = function() {
				this.animation.state = 'over';
			};
			this.onOut = function() {
				this.animation.state = 'idle';
			};
			this.onDown = function() {
				this.animation.state = 'down';
			};

			this.onUp = function() {
				this.animation.state = 'over';
			};
			this.animation.state = 'idle';
		}

		this.scenes = params.scenes; // deprecate ? 
		
		if (params.func) this.func = window[params.func]; 
		if (params.callback) this.callback = params.callback;
		/* shouldnt be attached to window - fine for now */

		if (params.onClick) this.onClick = params.onClick;
		if (params.onOver) this.onOver = params.onOver;
		if (params.onOut) this.onOut = params.onOut;
		if (params.onUp) this.onUp = params.onUp;
		if (params.onDown) this.onDown = params.onDown;

	}
}
