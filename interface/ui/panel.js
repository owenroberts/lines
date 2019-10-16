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
			type: "toggle"
		}));

		this.append(new UIButton({
			text: 'x',
			type: 'undock-btn',
			callback: this.undock.bind(this)
		}));

		this.append(new UIButton({
			text: "⥂",
			type: "order",
			callback: () =>  {
				this.order = +this.el.style.order + 1;
			}
		}));
	}

	set order(n) {
		this.el.style.order = n;
	}

	get order() {
		return this.el.style.order;
	}

	get isDocked() {
		return !this.el.classList.contains('undocked');
	}

	toggle() {
		if (this.open) this.addClass('closed');
		else this.removeClass('closed');
		this.open = !this.open;
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
		let row = _row 
			|| this.rows[this.rows.length - 1] 
			|| this.addRow();
		row.append(ui);
	}
}