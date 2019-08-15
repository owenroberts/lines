class Texture {
	constructor(params, debug) {
		this.params = params;
		this.label = params.label;
		this.scenes = params.scenes;
		this.locations = params.locations;
		this.items = [];
		this.tags = params.tags;

		this.ui = {};
		this.uiAdded = false;

		fetch(params.src)
			.then(response => { return response.json(); })
			.then(json => {
				this.json = json;
				for (let i = 0; i < this.locations.length; i++) {
					this.addItem(i, this.locations[i]);
				}
			});
	}


	addItem(index, location) {
		const item = new Item({x: location.x, y: location.y, ...this.params});
		item.label += ` ${index}`;
		item.addJSON(this.json);
		if (this.tags.includes('i')) item.animation.createNewState('still', index, index);
		if (this.tags.includes('r')) item.animation.randomFrames = true;
		this.items.push(item);
	}

	addLocation(x, y) {
		console.log(x, y);
		this.addItem(this.locations.length, { x: x, y: y }, this.params);		
		this.locations.push({ x: x, y: y });
	}

	display(view) {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i].display(view);
		}
	}

	mouseOver(x, y, zoom) {
		for (let i = 0; i < this.items.length; i++) {
			return this.items[i].mouseOver(x, y, zoom);
		}
	}

	/* fucked up repeating this shit ... */
	addUI() {
		if (this.ui.label && !this.uiAdded) {
			this.uiAdded = true;
			for (const key in this.ui) {
				const ui = this.ui[key];
				if (Array.isArray(ui)) {
					for (let i = 0; i < ui.length; i++) {
						edi.ui.panels.textures.add(ui[i], this.row);
					}
				} else {
					edi.ui.panels.textures.add(ui, this.row);
				}
			}
		} else if (!this.ui.label) {
			this.row = edi.ui.panels.textures.addRow();
			this.createUI();
		}
	}

	createUI() {
		const self = this;

		/* repeated in item */
		this.ui.label = new UIText({
			title: this.label,
			block: true,
			callback: function(value) {
				self.label = value;
			}
		});

		this.ui.locations = new UIDisplay({
			text: `${this.label} locations`,
			block: true
		});

		/* hide and show locations */

		for (let i = 0; i < this.items.length; i++) {
			
			const label = this.items[i].label;
			const position = this.items[i].position;
			
			this.ui[`${label}-x`] = new UIText({
				label: `${label}-x`,
				value: position.x,
				callback: function(value) {
					position.x = +value;
				}
			});

			this.ui[`${label}-y`] = new UIText({
				label: `${label}-y`,
				value: position.y,
				callback: function(value) {
					position.y = +value;
				}
			});
		}

		this.ui.add = new UIButton({
			title: "Add",
			callback: function() {
				edi.tool.set('location');
				edi.tool.callback = function(x, y) {
					self.addLocation(x, y);
					delete edi.tool.callback;
					edi.tool.set('zoom');
				}
			}
		});

		this.addUI();
	}

	removeUI() {
		edi.ui.panels.textures.clearComponents(this.row);
		this.uiAdded = false;
	}
}