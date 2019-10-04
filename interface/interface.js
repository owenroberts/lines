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

		const key = self.keys[k];

		if (k && key && document.activeElement.type != "text") {
			if (!ev.metaKey) ev.preventDefault();
			key.handler(ev, key);
			key.onPress(true);
		}
	}
	document.addEventListener("keydown", self.keyDown, false);

	window.toolTip = new UILabel({id: 'tool-tip'});

	this.load = function(file, callback) {
		fetch(file)
			.then(response => { return response.json(); })
			.then(data => {
				for (const key in data) {
					self.createPanel(key, data[key]);
				}
				console.log(Object.keys(data));
				this.addPanel = new UISelectButton({
					id: 'add-ui',
					options: Object.keys(data),
					callback: function(value) {
						self.panels[value].dock();
					},
					btn: '+'
				});
				console.log(this.addPanel);
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

	this.createUI = function(data, module, panel) {
		const params = { key: data.key, ...data.params };
		for (const k in data.fromModule) {
			params[k] = module[data.fromModule[k]];
		}

		if (data.set) {
			/* setter, no callback in module, just set prop
				does'nt work for layers ... need to make a setter or not use these*/
			params.callback = function(value) {
				module[data.set.prop] = data.set.number ? +value : value;
				if (data.set.layer) { } 
			};
			params.value = module[data.set.prop];
		}

		const ui = new uiClasses[data.type](params);
		if (data.row) panel.addRow();
		if (params.label) panel.add(new UILabel({ text: params.label}));
		panel.add(ui);

		if (params.prompt) ui.prompt = params.prompt; /* only key commands */
		if (params.key) self.keys[data.key] = ui;

		if (data.face) self.faces[data.face] = ui; /* wanna cut this */

		if (data.observe) {
			const elem = module[data.observe.elem];
			const attribute = data.observe.attribute;
			const observer = new MutationObserver(function(list) {
				for (const mut of list) {
					if (mut.type == 'attributes' && mut.attributeName == attribute) {
						ui.setValue(elem[attribute])
					}
				}
			});
			observer.observe(elem, { attributeFilter: [attribute] });
		} /* figuring out face should make this obsolete ... canvas only */
	};

	this.createPanel = function(key, data) {
		
		const panel = new UIPanel(data.id, data.label);
		self.panels[key] = panel;
		
		document.getElementById("panels").appendChild(panel.el);
		
		for (let i = 0; i < data.list.length; i++) {
			const module = data.list[i].module || data.module;
			const sub = data.list[i].sub || data.sub;
			const mod = sub ? app[module][sub] : app[module];
			self.createUI(data.list[i], mod, panel);
		}

		if (data.module == 'ui') app.ui[data.sub].panel = panel;
		if (data.onLoad) app[data.module][data.sub][data.onLoad]();

	};
}
