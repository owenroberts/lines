class Panel {
	constructor(id, label) {
		this.el = document.getElementById(id);
		if (!this.el) {
			this.el = document.createElement("div");
			this.el.id = id;
			document.getElementById("panels").appendChild(this.el);
		}
		this.el.classList.add("menu-panel");
		this.toggleBtn = document.createElement("div");
		this.toggleBtn.classList.add("panel-toggle");
		this.toggleBtn.textContent = "▽";
		this.toggleBtn.addEventListener("click", this.toggle.bind(this));
		const title = document.createElement("div");
		title.textContent = label;
		title.classList.add("panel-title");
		this.el.appendChild(title);
		this.el.appendChild(this.toggleBtn);
		this.rows = [];

		this.orderBtn = document.createElement("div");
		this.orderBtn.classList.add("panel-order");
		this.orderBtn.textContent = "⥂";
		this.orderBtn.addEventListener("click", ev => {
			this.el.style.order = +this.el.style.order + 1;
		});
		this.el.appendChild(this.orderBtn);
	}
	toggle() {
		if (this.el.clientHeight <= 25) {
			this.el.style.height = "auto";
			this.toggleBtn.innerHTML = "△";
		} else {
			this.el.style.height = 25 + "px";
			this.toggleBtn.innerHTML = "▽";
		}
	}
	addRow(id) {
		const row = document.createElement("div");
		row.classList.add("row");
		if (id) row.id = id;
		this.el.appendChild(row);
		this.rows.push(row);
		return row;
	}
	removeRow(row) {
		const index = this.rows.indexOf(row);
		this.rows.splice(index, 1);
		this.el.removeChild(row);
	}
	add(component, _row) {
		let row = _row;
		if (this.rows.length == 0) row = this.addRow();
		if (!row) row = this.rows[this.rows.length - 1];
		row.appendChild(component.el);
		if (component.label) component.addLabel();
		if (component.display)
			this.rows[this.rows.length - 1].insertBefore(component.display.el, component.el);
		if (component.input)
			this.rows[this.rows.length - 1].insertBefore(component.input.el, component.el);
	}
	clearComponents(row) {
		if (row) {
			while (row.firstChild) {
				row.removeChild(row.firstChild);
			}
		}
	}
}