class EditUI {
	constructor(createUI, panel) {
		this.added = false;
		this.color = '#ff00ff';
		this.uis = {};
		this.panel = panel;
		this.createUI = createUI;
	}

	addUI() {
		if (!this.row) this.row = this.panel.addRow();
		if (this.uis.label && !this.added) {
			this.added = true;
			for (const key in this.uis) {
				const ui = this.uis[key];
				if (Array.isArray(ui)) {
					for (let i = 0; i < ui.length; i++) {
						this.panel.add(ui[i], this.row);
					}
				} else {
					this.panel.add(ui, this.row);
				}
			}
		} else if (!this.uis.label) {
			this.createUI();
		}
	}

	removeUI() {
		edi.ui.panels.items.clearComponents(this.row);
		this.uiAdded = false;
	}

	update(obj) {
		for (const key in obj) {
			this.uis[key].setValue(obj[key]);
		}
	}
}