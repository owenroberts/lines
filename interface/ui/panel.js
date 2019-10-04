class UIPanel extends UICollection {
	constructor(id, label) {
		super({id: id});
		
		this.addClass("menu-panel");
		this.addClass("undocked");
		
		this.open = true;
		this.rows = [];

		this.append(new UILabel({text: label}));

		this.append(new UIToggle({
			onText: "△",
			offText: "▽",
			callback: this.toggle.bind(this),
			class: "toggle"
		}));

		this.append(new UIButton({
			title: 'x',
			class: 'undock-btn',
			callback: this.undock.bind(this)
		}));

		this.append(new UIButton({
			title: "⥂",
			class: "order",
			callback: () =>  {
				this.setOrder(+this.el.style.order + 1)
			}
		}));
	}

	setOrder(n) {
		this.el.style.order = this.order = n;
	}

	toggle() {
		if (this.open) this.addClass('closed');
		else this.removeClass('closed');
		this.open = !this.open;
	}

	isDocked() {
		return !this.el.classList.contains('undocked');
	}

	dock() {
		this.removeClass('undocked');
	}

	undock() {
		this.addClass('undocked');
	}

	addRow(id) {
		const row = new UIRow({ id: id });
		this.append(row);
		this.rows.push(row);
		return row;
	}

	removeRow(row) {
		const index = this.rows.indexOf(row);
		this.rows.splice(index, 1);
		this.remove(row);
	}

	add(ui, _row) {
		let row = _row || this.rows[this.rows.length - 1] || this.addRow();
		row.append(ui);
	}
}