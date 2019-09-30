class UIPanel extends UICollection {
	constructor(id, label) {
		super({id: id});
		
		this.addClass("menu-panel");
		this.addClass("hide");
		
		this.open = true;
		this.rows = [];

		const title = new UIElement();
		title.setTextContent(label);
		title.addClass('title');
		this.append(title);

		this.toggleBtn = new UIButton({
			title: "△",
			callback: this.toggle.bind(this),
			class: "toggle"
		});
		this.append(this.toggleBtn);

		const hideBtn = new UIButton({
			title: 'x',
			class: 'hide',
			callback: this.hide.bind(this)
		});
		this.append(hideBtn);

		const orderBtn = new UIButton({
			title: "⥂",
			class: "order",
			callback: function() {
				console.log(this);
				this.setOrder(+this.el.style.order + 1)
			}
		});
		this.append(orderBtn);
	}

	setOrder(n) {
		this.el.style.order = this.order = n;
	}

	toggle() {
		// console.log('toggle', this);
		if (this.open) {
			this.el.style.height = "25px";
			this.toggleBtn.innerHTML = "▽";
		} else {
			this.el.style.height = "auto";
			this.toggleBtn.innerHTML = "△";
		}
		this.open = !this.open;
	}

	isHidden() {
		return this.el.classList.contains('hide');
	}

	show() {
		// console.log(this);
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