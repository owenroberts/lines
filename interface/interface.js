function Interface(app) {
	const self = this;

	document.body.classList.add(Cool.mobilecheck() ? 'mobile' : 'desktop');

	this.panels = {};
	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */

	/* key commands */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		k = ev.shiftKey ? "shift-" + k : k
		k = ev.ctrlKey ? "ctrl-" + k : k;
		k = ev.altKey ? "alt-" + k : k;

		if (k && self.keys[k] && document.activeElement.type != "text") {
			if (!ev.metaKey) ev.preventDefault(); // works?
			const key = self.keys[k];
			key.handler(ev, key);
			key.onPress(true); /* js and css tool tip */
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	// this.toolTip = new UILabel({id: 'tool-tip'});
	window.toolTip = document.getElementById('tool-tip');

	this.load = function(file, callback) {
		fetch(file)
			.then(response => { return response.json(); })
			.then(data => {
				self.data = data;
				for (const key in data) {
					self.createPanel(key, data[key]);
				}
				initUI();
				self.settings.load();
				if (callback) callback();
			});
	};

	const uiClasses = {
		UIElement,
		UIRange,
		UIText,
		UIBlur,
		UITextRange,
		UIToggle,
		UIButton,
		UIColor,
		UISelect,
		UISelectButton
	};

	function initUI() {
		this.addPanel = new UISelectButton({
			id: 'add-ui',
			options: Object.keys(self.data),
			callback: function(value) {
				// self.showUI(value);
				self.panels[value].show();
			},
			btn: '+'
		});
	}

	this.showUI = function(key) {
		
	};

	this.createPanel = function(key, data) {
		
		const panel = new UIPanel(data.id, data.label);
		self.panels[key] = panel;
		
		document.getElementById("panels").appendChild(panel.el);
		/* create uis from list */
		for (let i = 0; i < data.list.length; i++) {
			const uiData = data.list[i];
			const module = uiData.module || data.module;
			const sub = uiData.sub || data.sub;
			const mod = sub ? app[module][sub] : app[module];
			const params = { key: uiData.key, ...uiData.params };
			for (const k in uiData.fromModule) {
				params[k] = mod[uiData.fromModule[k]];
			}

			/* setters don't need a callback for one value 
				class ? UISetter .... */
			if (uiData.set) {
				params.callback = function(value) {
					mod[uiData.set.prop] = uiData.set.number ? +value : value;
					if (uiData.set.layer) {
						// self.layers.updateProperty(u.set.layer, u.set.number ? +value : value);
					} /* need generic version of this ... */
				};
				params.value = mod[uiData.set.prop];
			}

			const ui = new uiClasses[uiData.type](params);
			if (uiData.row) panel.addRow();
			if (params.label) {
				panel.add(new UILabel({ text: params.label}));
			}
			panel.add(ui);
			if (params.prompt) ui.prompt = params.prompt;
			if (params.key) self.keys[uiData.key] = ui;
			if (uiData.face) self.faces[uiData.face] = ui;
			if (uiData.observe) {
				const elem = mod[uiData.observe.elem];
				const attribute = uiData.observe.attribute;
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

		if (data.module == 'ui') {
			app.ui[data.sub].panel = panel;
		}
		if (data.onLoad) app[data.module][data.sub][data.onLoad]();
		

	};
}
