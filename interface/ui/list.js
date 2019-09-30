class UIList extends UICollection {
	constructor(params) {
		super(params);
	}

	append(ui) {
		this.el.appendChild(ui.el);
	}

	insertBefore(ui, before) {
		this.el.insertBefore(ui.el, before.el);
	}

	get length() {
		return this.el.children.length;
	}

	get children() {
		return this.el.children;
	}

	addClass(c) {
		for (let i = 0; i < this.els.length; i++) {
			if (!this.els[i].classList.contains(c))
 				this.els[i].classList.add(c);
		}
	}

	setId(id, index) {
		this.children[index].id = id;
		// this.children[index].setAttribute('id', id);
	}

	remove(index) {
		this.children[index].remove();
	}

	looper(callback, start, end) {
		const len = end || this.length - 2;
		for (let i = start || 0; i <= len; i++) {
			callback(this.children[i]);
		}
	}
	
	
}