class Modal extends UICollection {
	constructor(title, callback) {
		super();
		this.addClass('modal');
		this.text = title;
		
		// better way to do this ?? 
		document.getElementById('container').appendChild(this.el);
		
		const self = this;

		this.submit = new UIButton({
			text: "Submit",
			callback: function() {
				callback();
				self.clear();
			}
		});

		this.append(this.submit);
		edi.ui.keys['enter'] = this.submit; /* not modular ... */

		this.cancel = new UIButton({
			text: "x",
			callback: ev => {
				this.clear();
			}
		});
		edi.ui.keys['escape'] = this.cancel;
		this.append(this.cancel);
	}

	add(component) {
		this.el.insertBefore(component.el, this.submit.el);
	}

	clear() {
		this.el.remove();
	}
}