/*
	simplified entity with clip reference for animation
	only supports index clips for now
*/

import { Entity } from './entity.js';

export class TextureEntity extends Entity {
	constructor(params, isDebug) {
		super(params, isDebug);
		this.center = false;
		this.clipName = `frame-${params.clipIndex}`;
		this.animation.createNewClip(`frame-${params.clipIndex}`, params.clipIndex, params.clipIndex);
	}

	display(editorOnScreen) {
		this.animation.clips.set(this.clipName);
		super.display(editorOnScreen);
	}
}