class Scene {
	constructor() {
		this.displaySprites = new SpriteCollection();
		this.updateSprites = new SpriteCollection();
		this.uiSprites = new SpriteCollection();
	}

	add(sprite) {
		this.displaySprites.add(sprite);
		this.updateSprites.add(sprite);
		this.uiSprites.add(sprite);
	}

	remove(sprite, type) {
		const types = type ? [type] : ['display', 'update', 'ui'];
		for (let i = 0; i < types.length; i++) {
			this[`${types[i]}Sprites`].remove(sprite);
			// if (index >= 0) this[`${types[i]}Sprites`].splice(index, 1);
		}
	}

	addSprite(sprite) {
		this.displaySprites.add(sprite);
		this.updateSprites.add(sprite);
	}

	addUI(sprite) {
		this.displaySprites.add(sprite);
		this.uiSprites.add(sprite);
	}

	addToDisplay(sprite) {
		this.displaySprites.add(sprite);
	}

	addToUpdate(sprite) {
		this.updateSprites.add(sprite);
	}

	addToUI(sprite) {
		this.uiSprites.add(sprite);
	}

	display(view) {
		this.displaySprites.all(sprite => { sprite.display(view) });
	}

	update(offset) {
		this.updateSprites.all(sprite => { sprite.update(offset) });
	}

	mouseMoved(x, y) {
		this.uiSprites.all(sprite => {
			sprite.over(x, y);
			sprite.out(x, y);
		});
	}

	mouseDown(x, y) {
		this.uiSprites.all(sprite => { sprite.down(x, y); });
	}

	mouseUp(x, y) {
		this.uiSprites.all(sprite => { sprite.up(x, y); });
	}
}