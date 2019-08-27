class TextureEdit extends Texture {
	constructor(params, debug) {
		super(params, debug);
		this.label = params.label;

		if (params.x && !params.locations) {
			this.locations = [{x: params.x, y: params.y}];
		}
		this.locked = false;
		this.ui = new TextureEditUI(this, edi.ui.panels.textures);
	}

	/* doesn't start over if more locations */
	addItem(index, location) {
		const item = new ItemEdit({label: `${this.label} ${index}`, x: location.x, y: location.y, scenes: this.scenes});
		item.addJSON(this.json);
		item.origin = this.params.src;
		item.texture = this;
		if (this.frame == 'index') item.animation.createNewState('still', index, index);
		else if (this.frame == 'random') item.animation.randomFrames = true;
		this.items.push(item);
	}

	addLocation(x, y) {
		this.addItem(this.locations.length, { x: Math.round(x), y: Math.round(y) });		
		this.locations.push({ x: Math.round(x), y: Math.round(y) });
		this.ui.remove();
		this.ui.create();
	}

	display(view) {
		if (!this.remove) {
			for (let i = 0; i < this.items.length; i++) {
				this.items[i].display(view);
			}
		}
	}

	mouseOver(x, y, zoom) {
		let item = false;
		for (let i = 0; i < this.items.length; i++) {
			item = this.items[i].mouseOver(x, y, zoom);
			if (item) return item;
		}
		return item;
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