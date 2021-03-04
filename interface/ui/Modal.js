class UIModal extends UICollection {
	constructor(title, app, position, callback) {
		super({});
		this.addClass('modal');
		this.append(new UILabel({ text: title }));

		this.el.style.left = `${Math.max(0, position.x - 100)}px`;
		this.el.style.top = `${Math.max(0, position.y - 20)}px`;

		// better way to do this ?? 
		document.getElementById('container').appendChild(this.el);
		
		const self = this;

		this.break = new UIElement({
			class: 'break'
		});
		this.append(this.break);

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
		this.el.insertBefore(component.el, this.break.el);
	}

	addBreak() {
		this.add(new UIElement({ class: "break" }));
	}

	addLabel(labelText) {
		this.add(new UILabel({ text: labelText}));
	}

	clear() {
		this.el.remove();
	}
}