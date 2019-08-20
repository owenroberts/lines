class TextureEdit extends Texture {
	constructor(params, debug) {
		super(params, debug);
		this.label = params.label;

		if (params.x && !params.locations) {
			this.locations = [{x: params.x, y: params.y}];
		}

		this.ui = new EditUI(this.createUI.bind(this), edi.ui.panels.textures); /* this is fucked right? */
	}

	/* doesn't start over if more locations */
	addItem(index, location) {
		const item = new ItemEdit({label: `${this.label} ${index}`, x: location.x, y: location.y, scenes: this.scenes});
		item.addJSON(this.json);
		if (this.frame == 'index') item.animation.createNewState('still', index, index);
		else if (this.frame == 'random') item.animation.randomFrames = true;
		this.items.push(item);
	}

	addLocation(x, y) {
		this.addItem(this.locations.length, { x: Math.round(x), y: Math.round(y) }, this.params);		
		this.locations.push({ x: Math.round(x), y: Math.round(y) });
		this.ui.removeUI();
		this.ui.createUI();
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

	createUI() {
		const self = this;

		/* repeated in item */
		this.ui.uis.label = new UIText({
			title: this.label,
			block: true,
			callback: function(value) {
				self.label = value;
			}
		});

		this.ui.uis.add = new UIButton({
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

		this.ui.uis.frame = new UISelect({
			options: [ 'index', 'random' ],
			selected: self.frame,
			callback: function(value) {
				self.frame = value;
				for (let i = 0; i < self.items.length; i++) {
					if (self.items[i].animation.randomFrames != value) {
						if (value == 'random') {
							self.items[i].animation.randomFrames = true;
							self.items[i].animation.createNewState('random', 0, self.items[i].animation.numFrames);
						} else {
							self.items[i].animation.randomFrames = false;
							self.items[i].animation.createNewState('still', i, i);
						}
					}
				}
				/* item method ? */
			}
		});

		this.ui.uis.remove = new UIButton({
			title: "Remove",
			callback: function() {
				self.remove = true;
				self.ui.removeUI();
			}
		});
		
		this.ui.addUI();
	}

	get data() {
		return {
			src: this.params.src,
			locations: this.items.map(item => item.position),
			scenes: this.scenes,
			tags: this.tags
		};
	}
}