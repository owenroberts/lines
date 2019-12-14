function Interface(app) {
	const self = this;
	const uiClasses = {
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
		UIRow
	};
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

		if (k && key && 
			document.activeElement.type != "text" && 
			!ev.metaKey) {
			ev.preventDefault();
			key.handler(ev, key);
			key.onPress(true);
		}
	}
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
		self.panels[key] = panel;
		
		document.getElementById("panels").appendChild(panel.el);
		
		for (let i = 0; i < data.list.length; i++) {
			const module = data.list[i].module || data.module;
			const sub = data.list[i].sub || data.sub;
			const mod = sub ? app[module][sub] : app[module];
			self.createUI(data.list[i], mod, panel);
		}

		if (data.module == 'ui') app.ui[data.sub].panel = panel;

		// this doesn't happen, needs animation first
		// if (data.onLoad) app[data.module][data.sub][data.onLoad]();
	};

	this.createUI = function(data, module, panel) {
		const params = { key: data.key, ...data.params };
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
		
		let ui;
		if (data.type == "UIRow") {
			ui = panel.addRow(data.k);
		} else {
			ui = new uiClasses[data.type](params);
			panel.add(ui, undefined, data.k);
		}

		/* could do this in module but addRow vs add(ui) is not super adaptable 
		  and all this may change ... */

		if (params.prompt) ui.prompt = params.prompt; /* only key commands */
		if (params.key) self.keys[data.key] = ui;
		if (data.face) self.faces[data.face] = ui; /* wanna cut this */
	};
}

/*

	fix line ^^
	fix wonky rendering
	explore canvas layers/frames ... 

	params vs arguments
		- need params for interface.json, too complicated to multiple things
		- no UIElements ... could use args for UiElement, UICollection
		- no real reason to
	class names are keys in interface.json
		- can't repeat class names as keys in json?
	modules
		- basically means adding export line to every file, then import line
		- actually more tedious than html
		- maybe use a js bundler instead

	need ids in interface.json?


	new things ....
	- prompt esc - null value -
		- could check against original
		- or set to 0
		- or just leave it as is
		- or test if (value)

*/