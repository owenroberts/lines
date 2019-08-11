class UIList {
	constructor(params) {
		this.els = document.getElementsByClassName(params.class);
	}

	getLength() {
		return this.els.length;
	}

	addClass(c) {
		for (let i = 0; i < this.els.length; i++) {
			if (!this.els[i].classList.contains(c))
 				this.els[i].classList.add(c);
		}
	}

	setId(id, index) {
		if (index != undefined)
			this.els[index].setAttribute('id', id);
	}

	remove(index) {
		this.els[index].remove();
	}

	looper(callback, start, end) {
		const len = end || this.els.length - 1;
		for (let i = start || 0; i <= len; i++) {
			callback(this.els[i]);
		}
	}
	
	append(elem) {
		this.el.appendChild(elem);
	}
}