/*
	editor animation class
*/

class EditorAnim extends GameAnim {
	constructor(debug) {
		super(debug);
	}

	getLayers() {
		const indexes = this.frames[this.currentFrame];
		if (!indexes) return [];
		const layers = [];
		for (let i = 0; i < indexes.length; i++) {
			layers.push(this.layers[indexes[i]]);
		}
		return layers;
	}
}