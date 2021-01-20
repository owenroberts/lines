class ItemEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
	}

	add() {
		const self = this; // need this? es6?

		let locRow = this.panel.addRow('location', 'location');
		this.uis.append(locRow);

		let xLabel = new UILabel({ text: "x", class: 'x-label' });
		locRow.append(xLabel);
		
		let x = new UIText({
			value: this.item.position.x,
			class: 'x-input',
			callback: function(value) {
				this.item.position.x = +value;
			}
		});
		locRow.append(x);

		let yLabel = new UILabel({ text: "y", class: 'y-label' });
		let y = new UIText({
			value: this.item.position.y,
			class: 'y-input',
			callback: function(value) {
				this.item.position.y = +value;
			}
		});
		locRow.append(yLabel);
		locRow.append(y);

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
		
		// why multiple ??
		let sceneSelector = new UISelect({
			options: this.item.scenes,
			selected: this.item.scenes[0],
			class: 'scene-selector',
			callback: function(value) {
				this.item.scenes[i] = value;
			}
		});
		sceneRow.append(sceneSelector);

		let addScene = new UIButton({
			text: "+ scene",
			class: 'add-scene',
			callback: function() {
				// const s = addSceneSelector(GAME.scenes[0], this.item.scenes.length);
				// this.panel.add(s, this.row);
				console.log(self);
			}
		});
		sceneRow.append(addScene);


		super.add();
	}
}