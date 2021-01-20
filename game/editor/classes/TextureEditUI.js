class TextureEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
		this.allSelected = false;
		this.prevSelected = undefined;
	}

	create() {
		const self = this;

		this.uis.add = new UIButton({
			text: "Add",
			class: "add",
			callback: function() {
				edi.tool.set('location');
				edi.tool.callback = function(x, y) {
					self.item.addLocation(x, y);
					delete edi.tool.callback;
					edi.tool.set('zoom');
				}
			}
		});

		this.uis.selectAll = new UIToggle({
			text: "All",
			class: "all",
			callback: function() {
				edi.tool.clear();
				self.allSelected = !self.allSelected;
				for (let i = 0; i < self.item.items.length; i++) {
					if (self.item.items[i].selected) self.prevSelected = i;
					self.item.items[i].selected = self.allSelected;
				}
				if (!self.allSelected && self.prevSelected)
					self.items[self.prevSelected].selected = true;
			}
		});

		this.uis.frame = new UISelect({
			options: [ 'index', 'random' ],
			selected: this.item.frame,
			class: "frame-type",
			callback: function(value) {
				self.item.frame = value;
				for (let i = 0; i < self.item.items.length; i++) {
					const item = self.item.items[i];
					if (item.animation.randomFrames != value) {
						if (value == 'random') {
							item.animation.randomFrames = true;
							item.animation.createNewState('random', 0, item.animation.endFrame);
						} else {
							item.animation.randomFrames = false;
							item.animation.createNewState('still', i, i);
						}
					}
				}
			}
		});

		super.create();
	}
}