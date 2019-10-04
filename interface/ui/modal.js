class Modal {
	constructor(title, callback) {
		this.el = document.createElement('div');
		this.el.classList.add('modal');
		this.el.textContent = title;
		document.getElementById('container').appendChild(this.el);
		
		const self = this;
		this.submit = new UIButton({
			text: "Submit",
			callback: function() {
				callback();
				self.clear();
			}
		});
		this.el.appendChild(this.submit.el);
		edi.ui.keys['enter'] = this.submit; /* not modular ... */

		this.cancel = new UIButton({
			text: "x",
			callback: ev => {
				this.clear();
			}
		});
		edi.ui.keys['escape'] = this.cancel;
		this.el.appendChild(this.cancel.el);
	}

	add(component) {
		this.el.insertBefore(component.el, this.submit.el);
	}

	clear() {
		this.el.remove();
	}
}