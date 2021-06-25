class TextureEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
		this.allSelected = false;
		this.prevSelected = undefined;
	}

	add() {

		let textureRow = this.panel.addRow('texture', 'texture');
		this.rows.push(textureRow);

		let addTexture = new UIButton({
			text: "Add",
			class: "add",
			key: "a",
			callback: () => {
				edi.tool.set('location');
				edi.tool.callback = (x, y) => {
					this.item.addLocation(x, y);
					delete edi.tool.callback;
					edi.tool.set('zoom');
				}
			}
		});
		textureRow.append(addTexture);
		edi.ui.keys['a'] = addTexture;

		textureRow.append(new UIToggle({
			text: "All",
			class: "all",
			callback: () => {
				edi.tool.clear();
				this.allSelected = !this.allSelected;
				for (let i = 0; i < this.item.locations.length; i++) {
					if (this.item.locations[i].isSelected) this.prevSelected = i;
					this.item.locations[i].isSelected = this.allSelected;
				}
				if (!this.allSelected && this.prevSelected)
					this.items[this.prevSelected].isSelected = true;
			}
		}));

		textureRow.append(new UISelect({
			options: [ 'index', 'random' ],
			selected: this.item.frame,
			class: "frame-type",
			callback: value => {
				this.item.frame = value;
				for (let i = 0; i < this.item.items.length; i++) {
					const item = this.item.items[i];
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
		}));

		// locations
		let removeRow = this.panel.addRow('remover', 'remover');
		this.rows.push(removeRow);
		this.item.locations.filter(loc => loc.isSelected)
			.forEach(loc => {
				removeRow.append(new UIButton({
					text: `${loc.i} X`,
					callback: () => {
						this.item.locations.splice(loc.i, 1);

					}
				}));
			});

		super.add();
	}
}