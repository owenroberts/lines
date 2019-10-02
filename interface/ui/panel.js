class UIPanel extends UICollection {
	constructor(id, label) {
		super({id: id});
		
		this.addClass("menu-panel");
		this.addClass("hide");
		
		this.open = true;
		this.rows = [];

		this.append(new UILabel({text: label}));

		/* make this a UIToggle */
		this.toggleBtn = new UIButton({
			title: "△",
			callback: this.toggle.bind(this),
			class: "toggle"
		});
		// this.append(this.toggleBtn);

		this.append(new UIToggle({
			title: "△",
			onText: "△",
			offText: "▽",
			callback: this.toggle.bind(this),
			class: "toggle"
		}))


		this.append(new UIButton({
			title: 'x',
			class: 'hide',
			callback: this.hide.bind(this)
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
		// console.log('toggle', this);
		if (this.open) {
			this.el.style.height = "25px";
		} else {
			this.el.style.height = "auto";
		}
		this.open = !this.open;
	}

	isHidden() {
		return this.el.classList.contains('hide');
	}

	show() {
		this.removeClass('hide');
	}

	hide() {
		this.addClass('hide');
	}

	addRow(id) {
		const row = new UIRow({
			id: id
		});
		this.append(row);
		this.rows.push(row);
		return row;
	}

	removeRow(row) {
		const index = this.rows.indexOf(row);
		// this.rows[index].clear();
		this.rows.splice(index, 1);
		this.remove(row);
	}

	add(ui, _row) {
		let row = _row || this.rows[this.rows.length - 1];
		if (!row) row = this.addRow();
		row.append(ui);
	}
}