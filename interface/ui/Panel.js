class UIPanel extends UICollection {
	constructor(id, label) {
		super({id: `${id}-panel`});
		this.addClass("panel");
		this.addClass("undocked");
		
		this.rows = [];

		this.header = new UIRow();
		this.header.addClass('header');
		this.append(this.header);

		this.open = new UIToggle({
			onText: "－",
			offText: "＋",
			type: "toggle",
			callback: () => {
				if (this.open.isOn) this.addClass('closed');
				else this.removeClass('closed');
			}
		});
		this.header.append(this.open);

		this.header.append(new UILabel({ text: label }));

		this.header.append(new UIButton({
			text: 'X',
			type: 'undock-btn',
			callback: this.undock.bind(this)
		}));

		this.orderBtn = new UIButton({
			text: this.order || "0",
			type: "order-btn",
			callback: () => {
				this.order = +this.el.style.order + 1;
				this.orderBtn.text = this.order;
			}
		});
		this.header.append(this.orderBtn);

		this.header.append(new UIButton({
			text: "[]",
			type: "block-btn",
			callback: () =>  {
				if (this.el.classList.contains('block')) 
					this.el.classList.remove('block');
				else 
					this.el.classList.add('block');
			}	
		}));

		this.header.append(new UIButton({
			text: "<",
			type: "headless-btn",
			callback: () => {
				if (this.el.classList.contains('headless')) 
					this.el.classList.remove('headless');
				else 
					this.el.classList.add('headless');
			}
		}));
	}

	set order(n) {
		this.orderBtn.text = n || "0";
		this.el.style.order = n;
	}

	get order() {
		return this.el.style.order;
	}

	get isDocked() {
		return !this.el.classList.contains('undocked');
	}

	get isBlock() {
		return this.el.classList.contains('block');
	}

	get isHeadless() {
		return this.el.classList.contains('headless');
	}

	get isOpen() {
		return this.open.value;
	}

	block() {
		this.el.classList.add('block');
	}

	headless() {
		this.el.classList.add('headless');
	}

	dock() {
		this.removeClass('undocked');
	}

	undock() {
		this.addClass('undocked');
	}

	addRow(k, className) {
		const row = new UIRow({ class: className, id: k });
		this.append(row, k);
		this.rows.push(row);
		return row;
	}

	removeRow(row) {
		const index = this.rows.indexOf(row);
		this.rows.splice(index, 1);
		this.remove(row);
	}

	add(ui, _row, k) {
		// if (ui.prompt == "Go To Frame") console.log(ui)
		let row = _row 
			|| this.rows[this.rows.length - 1]
			|| this.addRow();
		if (ui.prompt == "Go To Frame") {
			
			// console.log(row)
		}
		row.append(ui, k);
	}
}