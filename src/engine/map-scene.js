/**
 * scene with offset for map
 */
export class MapScene extends Scene {
	update(offset) {
		for (let i = 0; i < this.sprites.length; i++) {
			assert(this.sprites[i].update, `sprite at ${i} has no update fn`);
			this.sprites[i].update(offset);
		}	
	}
}