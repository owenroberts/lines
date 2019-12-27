function Interface(app) {
	const self = this;
	const uiTypes = {
		UILabel,
		UIElement,
		UIRange,
		UIText,
		UIBlur,
		UITextRange,
		UIToggle,
		UIButton,
		UIColor,
		UISelect,
		UISelectButton,
		UICollection,
		UIList,
		UIRow
	};
	document.body.classList.add(Cool.mobilecheck() ? 'mobile' : 'desktop');

	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */
	this.panels = new UICollection({ id: "panels" });

	/* key commands */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		k = ev.shiftKey ? "shift-" + k : k
		k = ev.ctrlKey ? "ctrl-" + k : k;
		k = ev.altKey ? "alt-" + k : k;

		const key = self.keys[k];

		if (k && key && 
			document.activeElement.type != "text" && 
			!ev.metaKey) {
			ev.preventDefault();
			key.handler(ev, key);
			key.onPress(true);
		}
	};
	document.addEventListener("keydown", self.keyDown, false);

	window.toolTip = new UILabel({id: 'tool-tip'});
	document.getElementById('interface').appendChild(window.toolTip.el);

	this.load = function(file, callback) {
		fetch(file)
			.then(response => { return response.json(); })
			.then(data => {
				for (const key in data) {
					self.createPanel(key, data[key]);
				}

				this.addSelect(Object.keys(data));
				self.settings.load();
				if (callback) callback();
			});
	};


	this.addSelect = function(panelList) {
		const selector = new UICollection({id: 'selector'});
		selector.append(new UISelectButton({
			options: panelList,
			callback: function(value) {
				self.panels[value].dock();
			},
			btn: '+'
		}));
	};

	this.createPanel = function(key, data) {
		
		const panel = new UIPanel(key, data.label);
		this.panels.append(panel, key);
		
		for (let i = 0; i < data.uis.length; i++) {
			const uis = data.uis[i];
			const mod = uis.sub ? app[uis.module][uis.sub] : app[uis.module];
			for (let j = 0; j < uis.list.length; j++) {
				self.createUI(uis.list[j], mod, panel);
			}
			if (uis.module == 'ui' && uis.sub) 
				app.ui[uis.sub].panel = panel;
		}
	};

	this.createUI = function(data, module, panel) {

		const params = { ...data.params };
		if (data.key) params.key = data.key;

		// most callbacks
		for (const k in data.fromModule) {
			params[k] = module[data.fromModule[k]];
		}

		/* direct set properties, toggle, number */
		if (data.number) {
			params.callback = function(value) {
				module[data.number] = +value;
			};
		}

		if (data.toggle) {
			params.callback = function() {
				module[data.toggle] = !module[data.toggle];
			};
		}

		if (data.row) panel.addRow();
		if (params.label) panel.add(new UILabel({ text: params.label}));
		
		let ui = new uiTypes[data.type](params);
		if (data.k) panel.append(ui, data.k);
		else panel.add(ui);

		/* add is to row, append is adding it straight there */

		if (params.prompt) ui.prompt = params.prompt; /* only key commands */
		if (params.key) self.keys[data.key] = ui;
		if (data.face) self.faces[data.face] = ui; /* wanna cut this */
	};
}