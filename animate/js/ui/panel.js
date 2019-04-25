class Panel {
	constructor(id, label) {
		this.el = document.getElementById(id);
		if (!this.el) {
			this.el = document.createElement("div");
			this.el.id = id;
			document.getElementById("panels").appendChild(this.el);
		}
		this.el.classList.add("menu-panel");
		this.open = false;
		this.rows = [];

		const title = document.createElement("div");
		title.textContent = label;
		title.classList.add("title");
		this.el.appendChild(title);
		
		this.toggleBtn = document.createElement("div");
		this.toggleBtn.classList.add("toggle");
		this.toggleBtn.textContent = "▽";
		this.toggleBtn.addEventListener("click", this.toggle.bind(this));
		this.el.appendChild(this.toggleBtn);

		const orderBtn = document.createElement("div");
		orderBtn.classList.add("order");
		orderBtn.textContent = "⥂";
		orderBtn.addEventListener("click", ev => {
			this.el.style.order = +this.el.style.order + 1;
		});
		this.el.appendChild(orderBtn);
	}

	toggle() {
		if (this.open) {
			this.el.style.height = "25px";
			this.toggleBtn.innerHTML = "▽";
		} else {
			this.el.style.height = "auto";
			this.toggleBtn.innerHTML = "△";
		}
		this.open = !this.open;
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
		let row = _row || this.rows[this.rows.length - 1];
		if (!row) row = this.addRow();
		row.appendChild(component.el);
		if (component.label) component.addLabel();
		if (component.display) 
			row.insertBefore(component.display.el, component.el);
		if (component.input) 
			row.insertBefore(component.input.el, component.el);
	}

	clearComponents(row) {
		if (row) {
			while (row.firstChild) {
				row.removeChild(row.firstChild);
			}
		}
	}
}