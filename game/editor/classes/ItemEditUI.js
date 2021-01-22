class ItemEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
	}

	add() {
		const self = this; // need this? es6?

		let locRow = this.panel.addRow('location', 'location');
		this.uis.append(locRow);

		locRow.append(new UILabel({ text: "x", class: 'x-label' }));
		this.uis.x = new UIText({
			value: this.item.position.x,
			class: 'x-input',
			callback: n => { this.item.position.x = +n; }
		});
		locRow.append(this.uis.x);

		locRow.append(new UILabel({ text: "y", class: 'y-label' }));
		this.uis.y = new UIText({
			value: this.item.position.y,
			class: 'y-input',
			callback: n => { this.item.position.y = +n; }
		});
		locRow.append(this.uis.y);

		let focus = new UIButton({
			text: "📍",
			class: 'focus',
			callback: function() {
				edi.zoom.view.x = self.item.position.x;
				edi.zoom.view.y = self.item.position.y;
			}
		});
		locRow.append(focus);

		let sceneRow = this.panel.addRow('scene', 'scene');
		this.uis.append(sceneRow);
		
		sceneRow.append(new UISelect({
			options: this.item.scenes,
			selected: this.item.scenes[0],
			class: 'scene-selector',
			callback: function(value) {
				this.item.scenes[i] = value;
			}
		}));

		sceneRow.append(new UIButton({
			text: "+ scene",
			class: 'add-scene',
			callback: function() {
				// const s = addSceneSelector(GAME.scenes[0], this.item.scenes.length);
				// this.panel.add(s, this.row);
				console.warn('you didnt finish this', self);
			}
		}));

		super.add();
	}
}