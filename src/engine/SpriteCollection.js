/*
	used mostly by SceneManager to handle sprites for each scene
	also used by game asset managers like pack or map
	deprecate? this is just scene
	maybe for components?
*/

export class SpriteCollection {
	constructor(sprites) {
		this.sprites = sprites ? [...sprites] : [];
		this.isActive = true; // any "displayable" needs active toggle
	}

	includes(sprite) {
		return this.sprites.includes(sprite);
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

	update() {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].update();
		}
	}

	display() {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].display();
		}
	}

	over(x, y) {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].over(x, y);
		}
	}

	out(x, y) {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].out(x, y);
		}
	}

	down(x, y) {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].down(x, y);
		}
	}

	up(x, y) {
		if (!this.isActive) return;
		for (let i = 0; i < this.sprites.length; i++) {
			this.sprites[i].up(x, y);
		}
	}
}