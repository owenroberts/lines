class TextureEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
	}

	create() {
		const self = this;

		this.uis.add = new UIButton({
			title: "Add",
			callback: function() {
				edi.tool.set('location');
				edi.tool.callback = function(x, y) {
					self.item.addLocation(x, y);
					delete edi.tool.callback;
					edi.tool.set('zoom');
				}
			}
		});

		this.uis.frame = new UISelect({
			options: [ 'index', 'random' ],
			selected: this.item.frame,
			callback: function(value) {
				self.item.frame = value;
				for (let i = 0; i < self.item.items.length; i++) {
					const item = self.item.items[i];
					if (item.animation.randomFrames != value) {
						if (value == 'random') {
							item.animation.randomFrames = true;
							item.animation.createNewState('random', 0, item.animation.numFrames);
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