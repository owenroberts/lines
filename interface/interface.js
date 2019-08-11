function Interface(app) {
	const self = this;

	this.panels = {};
	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */

	/* some version of update interface */

	/* keyboard events and handlers */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		if (ev.shiftKey) k = "shift-" + k;
		if (ev.ctrlKey) k = "ctrl-" + k;
		if (ev.altKey) k = "alt-" + k;

		if (k && self.keys[k] && document.activeElement.type != "text") {
			if (k == "tab") ev.preventDefault(); // works?
			const key = self.keys[k];
			if (key.handler) key.handler(ev, key);
			else key.callback();
			if (key.press) key.press();

		} else if (document.activeElement.id == 'title') {
			/* game interface may not have title 
				maybe there's a key down callback ... */
			if (k == 'enter') {
				app.files.saveFramesToFile(self.title.getValue());
				document.activeElement.blur();
			}
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	/* build interface */
	this.data = {};
	this.load = function(file) {
		fetch(file)
			.then(response => { return response.json(); })
			.then(data => {
				self.data = data;
				for (const key in data) {
					self.createPanel(key);
				}
				initUI();
				self.settings.load();
			});
	};

	const classes = {
		ui: UI,
		button: UIButton,
		toggle: UIToggleButton,
		text: UIText,
		range: UIRange,
		color: UIColor
	};

	function initUI() {
		const nav = document.getElementById('nav'); /* nav ?? */
		this.addPanel = new UISelect({
			id: 'add-ui',
			options: Object.keys(self.data),
			callback: function(value) {
				self.showUI(value);
			},
			btn: '+'
		});
	}

	this.showUI = function(key) {
		self.panels[key].show();
	};

	this.createPanel = function(key) {
		const data = self.data[key];
		let panel;
		/* grab panel reference if it exists, 
			create if it doesn't */
		if (self.panels[key]) {
			panel = self.panels[key];
		} else {
			panel = new Panel(data.id, data.label);
			self.panels[key] = panel;
		}
		/* create uis from list */
		for (let i = 0; i < data.list.length; i++) {
			const u = data.list[i];
			const module = u.module || data.module;
			const sub = u.sub || data.sub;
			const mod = sub ? app[module][sub] : app[module];
			const params = { key: u.key, ...u.params };
			for (const k in u.fromModule) {
				params[k] = mod[u.fromModule[k]];
			}

			/* setters don't need a callback for one value */
			if (u.set) {
				params.callback = function(value) {
					mod[u.set.prop] = u.set.number ? +value : value;
					if (u.set.layer) {
						self.layers.updateProperty(u.set.layer, u.set.number ? +value : value);
					} /* need generic version of this ... */
				};
				params.value = mod[u.set.prop];
			}

			const ui = new classes[u.type](params);
			if (u.row) panel.addRow();
			panel.add(ui);
			if (u.key) self.keys[u.key] = ui;
			if (u.face) self.faces[u.face] = ui;
			if (u.observe) {
				const elem = mod[u.observe.elem];
				const attribute = u.observe.attribute;
				const observer = new MutationObserver(function(list) {
					for (const mut of list) {
						if (mut.type == 'attributes' && mut.attributeName == attribute) {
							ui.setValue(elem[attribute])
						}
					}
				});
				observer.observe(elem, { attributeFilter: [attribute] });

			}
		}
	};

	if (Cool.mobilecheck()) document.body.classList.add('mobile');
	else document.body.classList.add('desktop');
}
