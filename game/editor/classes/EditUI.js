class EditUI {
	constructor(item, panel) {
		this.isAdded = false;
		this.color = '#ff00ff';
		this.panel = panel;
		this.uis = new UICollection({ class: 'item-collection' });
		this.item = item;
		this.docked = false;
	}

	add() {
		const self = this;

		let labelRow = this.panel.addRow('label', 'label');
		this.uis.append(labelRow);

		let label = new UIText({
			value: self.item.label,
			class: 'label',
			callback: function(value) {
				self.item.label = value;
			}
		});
		labelRow.append(label);

		let ediRow = this.panel.addRow('edit', 'edit');
		this.uis.append(ediRow);

		ediRow.append(new UIToggle({
			text: "⬉",
			class: "selectable",
			isOn: this.item.isSelectable,
			callback: () => {
				this.item.isSelectable = !this.item.isSelectable
			}
		}));

		let lock = new UIToggle({
			text: "🔓",
			class: 'lock',
			isOn: !this.item.isLocked,
			callback: function() {
				self.item.lock();
			}
		});
		ediRow.append(lock);

		let edit = new UIButton({
			text: "Edit",
			class: 'edit',
			callback: function() {
				console.log(self);
				window.open(`${location.origin}/${location.pathname.includes('lines') ? 'lines/' : ''}animate/?src=${self.item.origin}`, 'anim');
			}
		});
		ediRow.append(edit);

		let remove = new UIButton({
			text: "Remove",
			class: 'remove',
			callback: function() {
				self.item.remove = true;
				self.remove();
			}
		});
		ediRow.append(remove);

		this.panel.append(this.uis);

		this.isAdded = true;
	}

	remove() {
		this.uis.clear();
		this.isAdded = false;
	}

	update(obj) {
		for (const key in obj) {
			this.uis[key].value = obj[key];
		}
	}

	toggle() {
		if (this.docked) this.remove();
		else this.add();
		this.docked = !this.docked;
	}
}