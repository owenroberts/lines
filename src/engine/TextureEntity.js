/*
	simplified entity with state reference for animation
	only supports index states for now
*/

import { Entity } from './Entity.js';

export class TextureEntity extends Entity {
	constructor(params, debug) {
		super(params, debug);
		this.center = false;
		this.stateName = `frame-${params.stateIndex}`;
		this.animation.createNewState(`frame-${params.stateIndex}`, params.stateIndex, params.stateIndex);
	}

	draw(editorOnScreen) {
		this.animation.state = this.stateName;
		super.draw(editorOnScreen);
	}
}