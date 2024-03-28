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
			value: this.item.position[0],
			class: 'x-input',
			callback: n => { this.item.position[0] = +n; }
		});
		locRow.append(this.x);

		locRow.append(new UILabel({ text: "y", class: 'y-label' }));

		this.y = new UIText({
			value: this.item.position[1],
			class: 'y-input',
			callback: n => { 
				console.log('y', +n);
				this.item.position[1] = +n; 
			}
		});
		locRow.append(this.y);

		locRow.append(new UIButton({
			text: "📍",
			class: 'focus',
			callback: () => {
				edi.zoom.view.x = this.item.position[0];
				edi.zoom.view.y = this.item.position[1];
			}
		}));

		super.add();
	}
}