/*
	positions sprites relative to game canvas dimensions
	better name like user interface element? UISprite?
*/

import { ColliderSprite } from './collider-sprite';

export class UI extends ColliderSprite {
	constructor(params, isDebug) {
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
		this.isDebug = isDebug;
		this.center = params.center !== undefined ? params.center : true;

		if (params.hidden) this.isActive = false; /* hidden prob in garden json ...  */
		if (params.animation) {
			this.addAnimation(params.animation);
			this.animation.isPlaying = true;
		}
		
		if (params.clips) {
			for (const name in params.clips) {
				this.animation.clips.add(name, params.clips[name]);
			}
		}
		
		this.animation.clip.set("idle");

		if (params.isButton) {

			this.animation.createNewClip("idle", 0, 0);
			this.animation.createNewClip("over", 1, 1);
			this.animation.createNewClip("down", 2, 2);

			this.onOver = function() {
				this.animation.clips.set("over");
			};

			this.onOut = function() {
				this.animation.clips.set("idle");
			};

			this.onDown = function() {
				this.animation.clips.set("down");
			};

			this.onUp = function() {
				this.animation.clips.set("over");
			};

			this.animation.clips.set("idle");
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