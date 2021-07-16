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

		let mouseable = new UIToggle({
			text: "🐭",
			class: "selectable",
			isOn: this.item.isSelectable,
			callback: () => {
				this.item.isSelectable = !this.item.isSelectable;
				this.item.select(false);
			}
		});
		ediRow.append(mouseable);
		edi.ui.keys.m = mouseable;

		ediRow.append(new UIToggle({
			text: "🔓",
			class: 'lock',
			isOn: !this.item.isLocked,
			callback: function() {
				self.item.lock();
			}
		}));

		ediRow.append(new UIButton({
			text: "✎",
			class: 'edit',
			callback: function() {
				window.open(`${location.origin}/${location.pathname.includes('lines') ? 'lines/' : ''}animate/?src=${self.item.src}`, 'anim');
			}
		}));

		ediRow.append(new UIButton({
			text: '⇩',
			class: 'loader',
			callback: function() {
				self.item.isLoaded = !self.item.isLoaded;
			}
		}))

		ediRow.append(new UIButton({
			text: "🗑️",
			class: 'remove',
			callback: function() {
				if (prompt('remove?')) {
					self.item.isRemoved = true;
					self.remove();
				}
			}
		}));

		let sceneRow = this.panel.addRow('scene', 'scene');
		this.rows.push(sceneRow);
		
		// replace with list of scenes and x to remove (similar to states ui)
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

		this.isAdded = true;
	}

	remove() {
		if (edi.ui.keys.m) delete edi.ui.keys.m;
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