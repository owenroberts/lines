class EditUI {
	constructor(item, panel) {
		this.added = false;
		this.color = '#ff00ff';
		this.uis = {};
		this.panel = panel;
		this.item = item;
	}

	create() {
		const self = this;

		this.uis.label = new UIText({
			title: self.item.label,
			block: true,
			callback: function(value) {
				self.item.label = value;
			}
		});

		this.uis.remove = new UIButton({
			title: "Remove",
			callback: function() {
				self.item.remove = true;
				self.remove();
			}
		});

		this.uis.edit = new UIButton({
			title: "Edit",
			callback: function() {
				window.open(`${location.origin}/${location.pathname.includes('lines') ? 'lines/' : ''}animate/?src=${self.item.origin}`, 'anim');
			}
		});

		this.uis.lock = new UIToggleButton({
			title: "🔓",
			on: "🔓",
			off: "🔓",
			isOn: !this.item.locked,
			callback: function() {
				self.item.lock();
			}
		});

		this.add();
	}

	add() {
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
			this.create();
		}
	}

	remove() {
		edi.ui.panels.items.clearComponents(this.row);
		this.added = false;
	}

	update(obj) {
		for (const key in obj) {
			this.uis[key].setValue(obj[key]);
		}
	}
}