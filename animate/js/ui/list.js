class UIList {
	constructor(params) {
		this.els = document.getElementsByClassName(params.class);
	}
	getLength() {
		return this.els.length;
	}
	addClass(clas) {
		for (let i = 0; i < this.els.length; i++) {
			const elem = this.els[i];
			if (!elem.classList.contains(clas)){
 				elem.classList.add(clas);
 			}
		}
	}
	setId(id, index) {
		if (index != undefined) {
			this.els[index].setAttribute('id', id);
		}
	}
	remove(index) {
		this.els[index].remove();
	}
	looper(callback, start, end) {
		const len = end || this.els.length;
		for (let i = start || 0; i < len; i++) {
			const elem = this.els[i];
			callback(elem);
		}
	}
	append(elem) {
		this.el.appendChild(elem);
	}
}