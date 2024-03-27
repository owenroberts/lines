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
		return sprite;
	}

	remove(sprite, type) {
		const types = type ? [type] : ['display', 'update', 'ui'];
		for (let i = 0; i < types.length; i++) {
			this[`${types[i]}Sprites`].remove(sprite);
			// if (index >= 0) this[`${types[i]}Sprites`].splice(index, 1);
		}
	}

	addSprite(sprite) {
		if (Array.isArray(sprite)) {
			sprite.forEach(s => { this.addSprite(s) });
			return;
		}

		this.displaySprites.add(sprite);
		this.updateSprites.add(sprite);
		return sprite;
	}

	addUI(sprite) {
		this.displaySprites.add(sprite);
		this.uiSprites.add(sprite);
		return sprite;
	}

	addToDisplay(sprite) {
		this.displaySprites.add(sprite);
		return sprite;
	}

	addToUpdate(sprite) {
		this.updateSprites.add(sprite);
		return sprite;
	}

	addToUI(sprite) {
		this.uiSprites.add(sprite);
		return sprite;
	}

	display(view) {
		this.displaySprites.all(sprite => {
			if (!sprite.display) console.log(sprite);
			sprite.display(view);
		});
	}

	update(offset) {
		this.updateSprites.all(sprite => { sprite.update(offset); });
	}

	mouseMoved(x, y) {
		this.uiSprites.all(sprite => {
			if (!sprite.over) console.log(sprite)
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

LinesEngine.Scene = Scene;