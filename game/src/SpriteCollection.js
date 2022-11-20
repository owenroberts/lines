/*
	used mostly by SceneManager to handle sprites for each scene
	also used by game asset managers like pack or map
*/

class SpriteCollection {
	constructor(sprites) {
		this.sprites = sprites ? [...sprites] : [];
	}

	get length() {
		return this.sprites.length;
	}

	includes(sprite) {
		return this.sprites.includes(sprite);
	}

	sprite(index) {
		return this.sprites[index];
	}

	remove(sprite) {
		this.sprites.splice(this.sprites.indexOf(sprite), 1);
	}

	clear() {
		this.sprites = [];
	}

	add(sprite) {
		if (!this.sprites.includes(sprite)) this.sprites.push(sprite);
	}

	// loop 
	all(callback) {
		for (let i = 0; i < this.sprites.length; i++) {
			callback(this.sprites[i], i);
		}
	}

	update() {
		this.all(sprite => { sprite.update(); });
	}

	display() {
		this.all(sprite => { sprite.display(); });
	}


	over(x, y) {
		this.all(sprite => { sprite.over(x, y); });
	}

	out(x, y) {
		this.all(sprite => { sprite.out(x, y); });
	}

	down(x, y) {
		this.all(sprite => { sprite.down(x, y); });
	}

	up(x, y) {
		this.all(sprite => { sprite.up(x, y); });
	}


}