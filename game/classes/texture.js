class Texture {
	constructor(params, debug) {
		this.params = params;
		this.label = params.label;
		this.scenes = params.scenes;
		this.locations = params.locations;
		this.items = [];
		this.frame = params.frame || 'index';

		if (params.x && !params.locations) {
			this.locations = [{x: params.x, y: params.y}];
		}

		if (params.src) {
			fetch(params.src)
				.then(response => { return response.json(); })
				.then(json => {
					this.json = json;
					for (let i = 0; i < this.locations.length; i++) {
						this.addItem(i, this.locations[i]);
					}
			});
		}
	}

	addJSON(json) {
		this.json = json;
		for (let i = 0; i < this.locations.length; i++) {
			this.addItem(i, this.locations[i]);
		}
	}

	/* doesn't start over if more locations */
	addItem(index, location) {
		const item = new Item({label: `${this.label} ${index}`, x: location.x, y: location.y, scenes: this.scenes});
		item.addJSON(this.json);
		if (this.frame == 'index') item.animation.createNewState('still', index, index);
		else if (this.frame == 'random') item.animation.randomFrames = true;
		this.items.push(item);
	}

	display(view) {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].display(view);
		}
	}

	update(offset) {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].update(offset);
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
}