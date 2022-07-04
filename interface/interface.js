function Interface(app) {
	const self = this;
	const uiTypes = {
		UILabel,
		UIElement,
		UIRange,
		UIText,
		UINumber,
		UINumberRange,
		UINumberStep,
		UIToggle,
		UIButton,
		UIColor,
		UISelect,
		UISelectButton,
		UICollection,
		UIList,
		UIRow,
		UIInput
	};

	// turn off ipad request desktop
	document.body.classList.add(Cool.mobilecheck() ? 'mobile' : 'desktop');

	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */
	this.panels = new UICollection({ id: "panels" });

	// break between collapsed and uncollapsed panels
	this.panels.append(new UIElement({ id: 'panel-break' }));

	/* key commands */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k == "space") ev.preventDefault();
		k = ev.shiftKey ? "shift-" + k : k;
		k = ev.ctrlKey ? "ctrl-" + k : k;
		k = ev.altKey ? "alt-" + k : k;

		const ui = self.keys[k];

		if (k && ui && 
			document.activeElement.type !== "text" &&
			document.activeElement.type !== "number" && 
			!ev.metaKey) {
			ev.preventDefault();
			ui.handler(ev.target.value, true);
			ui.onPress(true);
		}
	};
	document.addEventListener("keydown", self.keyDown, false);

	window.toolTip = new UILabel({id: 'tool-tip'});
	document.getElementById('interface').appendChild(window.toolTip.el);

	// use module ? 
	this.load = function(file, callback) {
		fetch(file)
			.then(response => { return response.json(); })
			.then(data => {
				self.addQuickRef(data);
				for (const key in data) {
					self.createPanel(key, data[key]);
				}
				self.addSelect([...Object.keys(data), 'quickRef']);
				// self.settings.load();
				if (callback) callback();
			});
	};

	this.addQuickRef = function(data) {
		const quickRef = new UIPanel('quickRef', 'Quick Ref');
		quickRef.fontSize = 11;
		quickRef.list = [];
		self.panels.append(quickRef, 'quickRef');

		// not handled by individual uis
		quickRef.add(new UILabel({ text: "Scale" }));
		

		const quickRefScale = new UINumber({
			placeholder: 11,
			callback: function(value) {
				if (!value || value < 10 || value > 40) return;
				quickRef.fontSize = +value;
				document.body.style.setProperty('--quick-ref-font-size', +value);
			}
		});
		
		quickRef.add(quickRefScale);
		quickRef.add(new UIButton({
			text: 'Reset',
			callback: function() {
				quickRefScale.update(11);
			}
		}));

		self.faces.quickRefScale = quickRefScale;

		quickRef.add(new UIButton({
			text: "+",
			callback: function() {

				// m1 choose a panel
				const m1 = new UIModal("panels", app, quickRef.position, function() {
					const options = {};
					data[p1.value].uis.forEach(ui => {
						ui.list.forEach(el => {

							let createQuickUI = (el.number || el.toggle) ? true : false;
							if (el.fromModule) createQuickUI = el.fromModule.callback ? true : false;

							if (createQuickUI) {
								const title = el.params ? 
									el.params.text || el.params.onText || el.params.label || el.face:
									el.fromModule.callback;
								
								el.mod = ui.module;
								el.sub = ui.sub;

								options[title] = el;
							}
						});
					});

					if (Object.keys(options).length > 0) {
						// m2 choose a callback
						const m2 = new UIModal("ui", app, quickRef.position, function() {
							const d = options[p2.value];
							const ui = self.createUI(d, d.mod, d.sub, quickRef);
							quickRef.list.push(d);
						});

						const p2 = new UISelect({
							options: Object.keys(options)
						});
						m2.add(p2);

						const callFunc = new UIButton({
							text: "Execute",
							callback: function() {
								m2.clear();
								const d = options[p2.value];
								console.log(d);

								const m = d.sub ? app[d.mod][d.sub] : app[d.mod];
								// most callbacks
								if (d.fromModule) {
									if (d.fromModule.callback) {
										m[d.fromModule.callback]();
									}
								}

								/* 
									direct set properties, toggle, number 
									doesn't update ui
								*/
								if (d.number) {
									m[d.number] = +prompt(d.prompt || d.label);
								}

								if (d.toggle) {
									m[d.toggle] = !m[d.toggle];
								}

							}
						});
						m2.add(callFunc);
					} else {
						m1.clear();
					}
				});

				const p1 = new UISelect({ options: Object.keys(data) });
				m1.add(p1);
			}
		}));
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
			for (let j = 0; j < uis.list.length; j++) {
				self.createUI(uis.list[j], uis.module, uis.sub, panel);
			}
			if (uis.module == 'ui' && uis.sub) app.ui[uis.sub].panel = panel;
		}
	};

	this.createUI = function(data, mod, sub, panel) {

		const m = sub ? app[mod][sub] : app[mod]; // module with sub module
		// this is because a bunch of modules are "sub modules" of the ui object, for no reason?

		const params = { ...data.params };
		if (data.key) params.key = data.key;

		// most callbacks
		for (const k in data.fromModule) {
			params[k] = m[data.fromModule[k]];
		}

		/* direct set properties, toggle, number */
		if (data.number) {
			params.callback = function(value) {
				m[data.number] = +value;
			};
		}

		if (data.toggle) {
			params.callback = function() {
				m[data.toggle] = !m[data.toggle];
			};
		}

		if (data.row) panel.addRow();

		/* 
			this is counter intuitive because 
			labels get created before ui, 
			doesn't work for uis created in js
		*/
		if (data.label) panel.add(new UILabel({ text: data.label}));
		
		let ui = new uiTypes[data.type](params);
		
		if (data.type == 'UIRow') panel.addRow(data.k, params.class);
		else if (data.k) panel.append(ui, data.k);
		else panel.add(ui);

		/* add is to row, append is adding it straight there */

		if (params.prompt) ui.prompt = params.prompt; /* only key commands -- why here? */
		if (params.key) self.keys[data.key] = ui;
		if (data.face) self.faces[data.face] = ui; /* wanna cut this */
	};

	// resize interface div

	const iDiv = document.getElementById('interface');
	const resize = document.createElement('div');
	resize.id = 'resize';
	let dragging = false;
	let iWidth = iDiv.clientWidth;
	let resizeX = 0;

	resize.textContent = '|||';
	iDiv.appendChild(resize);

	resize.addEventListener('mousedown', ev => {
		dragging = true;
		resizeX = ev.pageX;
	});

	document.addEventListener('mouseup', ev => {
		if (dragging) {
			dragging = false;
			iWidth = +iDiv.style.maxWidth.replace('px', '');
		}
	});

	document.addEventListener('mousemove', ev => {
		if (dragging) {
			const delta = ev.pageX - resizeX;
			iDiv.style.maxWidth = `${iWidth + delta}px`;
		}
	});
}