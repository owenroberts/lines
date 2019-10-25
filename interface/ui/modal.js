class UIModal extends UICollection {
	constructor(title, app, position, callback) {
		super();
		this.addClass('modal');
		this.text = title;

		this.el.style.top = `${position.top - 20}px`;
		this.el.style.left = `${position.left - 100}px`;

		
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
		app.ui.keys['enter'] = this.submit; /* not modular ... */

		this.cancel = new UIButton({
			text: "x",
			callback: ev => {
				this.clear();
			}
		});
		app.ui.keys['escape'] = this.cancel;
		this.append(this.cancel);
	}

	add(component) {
		this.el.insertBefore(component.el, this.submit.el);
	}

	clear() {
		this.el.remove();
	}
}