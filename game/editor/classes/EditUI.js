class EditUI {
	constructor(item, panel) {
		this.isAdded = false;
		this.color = '#ff00ff';
		this.panel = panel;
		this.rows = [];
		this.item = item;
		this.docked = false;
	}

	add() {
		const self = this;

		let labelRow = this.panel.addRow('label', 'label');
		this.rows.push(labelRow);

		labelRow.append(new UIText({
			value: self.item.label,
			class: 'label',
			callback: function(value) {
				self.item.label = value;
			}
		}));

		let ediRow = this.panel.addRow('edit', 'edit');
		this.rows.push(ediRow);

		ediRow.append(new UIToggle({
			text: "🐭",
			class: "selectable",
			isOn: this.item.isSelectable,
			callback: () => {
				this.item.isSelectable = !this.item.isSelectable
			}
		}));

		ediRow.append(new UIToggle({
			text: "🔓",
			class: 'lock',
			isOn: !this.item.isLocked,
			callback: function() {
				self.item.lock();
			}
		}));

		ediRow.append(new UIButton({
			text: "Edit",
			class: 'edit',
			callback: function() {
				console.log(self);
				window.open(`${location.origin}/${location.pathname.includes('lines') ? 'lines/' : ''}animate/?src=${self.item.origin}`, 'anim');
			}
		}));

		ediRow.append(new UIButton({
			text: "Remove",
			class: 'remove',
			callback: function() {
				if (prompt('remove?')) {
					self.item.isRemoved = true;
					self.remove();
				}
			}
		}));

		this.isAdded = true;
	}

	remove() {
		this.rows.forEach(row => {
			this.panel.removeRow(row);
		});
		this.rows = [];
		this.isAdded = false;
	}

	update(obj) {
		for (const key in obj) {
			this[key].value = obj[key];
		}
	}

	toggle() {
		if (this.docked) this.remove();
		else this.add();
		this.docked = !this.docked;
	}
}