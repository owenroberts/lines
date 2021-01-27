class ItemEditUI extends EditUI {
	constructor(item, panel) {
		super(item, panel);
	}

	add() {
		let locRow = this.panel.addRow('location', 'location');
		this.rows.push(locRow);

		locRow.append(new UILabel({ text: "x", class: 'x-label' }));

		// uis that need to be updated assigned to this
		this.x = new UIText({
			value: this.item.position.x,
			class: 'x-input',
			callback: n => { this.item.position.x = +n; }
		});
		locRow.append(this.x);

		locRow.append(new UILabel({ text: "y", class: 'y-label' }));

		this.y = new UIText({
			value: this.item.position.y,
			class: 'y-input',
			callback: n => { this.item.position.y = +n; }
		});
		locRow.append(this.y);

		locRow.append(new UIButton({
			text: "📍",
			class: 'focus',
			callback: () => {
				edi.zoom.view.x = this.item.position.x;
				edi.zoom.view.y = this.item.position.y;
			}
		}));

		let sceneRow = this.panel.addRow('scene', 'scene');
		this.rows.push(sceneRow);
		
		sceneRow.append(new UISelect({
			options: this.item.scenes,
			selected: this.item.scenes[0],
			class: 'scene-selector',
			callback: value => {
				this.item.scenes[i] = value;
			}
		}));

		sceneRow.append(new UIButton({
			text: "+ scene",
			class: 'add-scene',
			callback: () => {
				// const s = addSceneSelector(GAME.scenes[0], this.item.scenes.length);
				// this.panel.add(s, this.row);
				console.warn('you didnt finish this', this);
			}
		}));

		super.add();
	}
}