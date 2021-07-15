/*
	simplified entity with state reference for animation
	only supports index states for now
*/

class TextureEntity extends Entity {
	constructor(params, stateIndex, debug) {
		super(params, debug);
		this.center = false;
		this.stateName = `frame-${params.stateIndex}`;
		this.animation.createNewState(`frame-${params.stateIndex}`, params.stateIndex, params.stateIndex);

	}

	display(editorOnScreen) {
		this.animation.state = this.stateName;
		super.display(editorOnScreen);
	}
}