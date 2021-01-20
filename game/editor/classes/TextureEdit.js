class TextureEdit extends Texture {
	constructor(params, debug) {
		super(params, debug);
		if (params.src) this.origin = params.src;
		this.label = params.label;

		if (params.x !== undefined && !params.locations) {
			this.locations = [{x: params.x, y: params.y}];
		}
		this.locked = false;
		this.ui = new TextureEditUI(this, edi.ui.panels.textures);
	}

	addLocation(x, y) {
		super.addLocation(x, y, this.locations.length);
		this.ui.remove();
		this.ui.create();
	}

	display(view) {
		if (!this.remove) {
			for (let i = 0; i < this.locations.length; i++) {
				let x = this.locations[i].x + this.offset.x;
				let y = this.locations[i].y + this.offset.y;
				if (this.isInMapBounds(view, x, y, this.animation.width, this.animation.height)) {
					if (this.center) {
						x -= this.animation.width / 2;
						y -= this.animation.height / 2;
					}

					if (this.locations[i].i !== undefined) 
						this.animation.state = `f-${this.locations[i].i}`;
					this.animation.draw(x, y);
				}
			}
		}
	}

	isInMapBounds(view, x, y, width, height) {
		if (x + width > view.x - GAME.width/2 &&
			x < view.x + view.width + GAME.width/2 &&
			y + height > view.y - GAME.height/2 &&
			y < view.y + view.height + GAME.height/2 ) {
			return true;
		} else {
			return false;
		}
	}

	isMouseOver(x, y, zoom) {
		// let item = false;
		// for (let i = 0; i < this.locations.length; i++) {

		// 	item = this.items[i].mouseOver(x, y, zoom);
		// 	if (item) return item;
		// }
		// return item;
	}

	get data() {
		return {
			src: this.params.src,
			locations: this.items.map(item => item.position),
			scenes: this.scenes,
			tags: this.tags
		};
	}

	lock() {
		this.locked = !this.locked;
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].lock(this.locked);
		}
	}
}