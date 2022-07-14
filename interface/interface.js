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
		UIToggleCheck,
		UIButton,
		UIColor,
		UISelect,
		UISelectButton,
		UICollection,
		UIList,
		UIRow,
		UIInput,
		UIInputList
	};

	// turn off ipad request desktop
	document.body.classList.add(Cool.mobilecheck() ? 'mobile' : 'desktop');

	this.keys = {};
	this.faces = {}; /* references to faces we need to update values ???  */
	this.panels = new UICollection({ id: "ui-panels", class: "panels" });
	this.quickRef = new QuickRef(app);
	
	this.maxPanels = 100; // limit number of panels open at one time, default 100, basically ignore this -- save for when we have abc layout
	this.maxWidth = 500;
	this.useMaxWidth = false;

	// break between collapsed and uncollapsed panels
	this.panels.append(new UIElement({ id: 'panel-break' }));

	// this.layout = new Layout(this); -- later
	const container = new UICollection({ id: 'container' });
	const interface = new UICollection({ id: 'interface' });
	container.append(interface);
	const selector = new UICollection({ id: 'selector' });
	interface.append(selector);
	interface.append(this.panels);
	const uiTimeline = new UICollection({ id: 'ui-timeline' });
	container.append(uiTimeline);
	const timelinePanels = new UICollection({ id: 'timeline-panels', class: 'panels' });
	uiTimeline.append(timelinePanels);

	window.toolTip = new UILabel({id: 'tool-tip'});
	interface.append(window.toolTip);

	this.toggleTimelineView = function(isOn) {
		if (isOn) {
			timelinePanels.append(self.panels.play);
			timelinePanels.append(self.panels.timeline);
		} else {
			self.panels.append(self.panels.play);
			self.panels.append(self.panels.timeline);
		}
	};

	this.toggleRL = function(isOn) {
		if (isOn) container.addClass('RL');
		else container.removeClass('RL');
	};

	let baseFontSize = 11;
	this.updateScale = function(value) {
		if (value) baseFontSize = +value;
		document.body.style.setProperty('--base-font-size', baseFontSize);
	};

	/* key commands */
	this.keyDown = function(ev) {
		let k = Cool.keys[ev.which];
		if (k === "space") ev.preventDefault();
		k = ev.shiftKey ? "shift-" + k : k;
		k = ev.ctrlKey ? "ctrl-" + k : k;
		k = ev.altKey ? "alt-" + k : k;

		const ui = self.keys[k];

		if (k && ui && 
			document.activeElement.type !== "text" &&
			document.activeElement.type !== "number" && 
			!ev.metaKey) {
			ev.preventDefault();
			ui.keyHandler(ev.target.value);
			ui.onPress(true);
		}
	};
	document.addEventListener("keydown", self.keyDown, false);

	async function loadInterfaceFiles(file, callback) {
		const appFile = await fetch(file).then(response => response.json());
		const interfaceFile = await fetch('../interface/interface.json').then(response => response.json());
		const data = { ...interfaceFile, ...appFile };
		for (const key in data) {
			self.createPanel(key, data[key]);
		}
		self.addSelect([
			...Object.keys(data).map(k => [k, data[k].label])
		]);
		// self.settings.load();
		self.quickRef.addData(data);
		if (callback) callback();
	}

	// use module ? 
	this.load = function(file, callback) {
		loadInterfaceFiles(file, callback);
	};

	this.addSelect = function(panelList) {
		
		const selectBtn = new UISelectButton({
			callback: function(value) {
				self.panels[value].dock();
			},
			btn: '+'
		});
		panelList.forEach(p => {
			const [option, label] = p;
			selectBtn.select.addOption(option, false, label);
		});
		selector.append(selectBtn);
	};

	this.createPanel = function(key, data) {
		
		const panel = new UIPanel({ 
			id: key, 
			label: data.label, 
			onToggle: function() {
				let openPanels = lns.ui.panels.uiList.filter(p => p.isOpen && p.isDocked);
				// console.log(openPanels) 
			}
		});
		this.panels.append(panel, key);
		
		for (let i = 0; i < data.uis.length; i++) {
			const uis = data.uis[i];
			for (let j = 0; j < uis.list.length; j++) {
				self.createUI(uis.list[j], uis.module, uis.sub, panel);
			}
			// gives panel to module -- give to all ?
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

		/* this is fuckin nuts right ... */
		if (data.toggle) {
			params.callback = function(value) {
				m[data.toggle] = typeof value !== 'undefined' ? value :
					!m[data.toggle];
			};
		}

		if (data.row) panel.addRow();

		/* 
			this is counter intuitive because 
			labels get created before ui, 
			doesn't work for uis created in js
		*/
		if (data.label) panel.add(new UILabel({ text: data.label }));
		
		// console.log(data);
		// console.log(panel.rows);
		let ui = new uiTypes[data.type](params);
		
		if (data.type == 'UIRow') panel.addRow(data.k, params.class);
		else if (data.k) panel.append(ui, data.k);
		else panel.add(ui);

		/* add is to row, append is adding it straight there */

		if (params.prompt) ui.prompt = params.prompt; /* only key commands -- why here? */
		if (params.key) self.keys[data.key] = ui;
		if (data.face) self.faces[data.face] = ui; /* wanna cut this */
	};

	this.toggleMaxWidth = function(value) {
		self.useMaxWidth = value;
		if (self.useMaxWidth) interface.addClass('max-width');
		else interface.removeClass('max-width');
	};

	this.setMaxWidth = function(value) {
		self.maxWidth = +value;
		interface.el.style.setProperty('--max-width', self.maxWidth);
	};

	this.update = function() {
		app.uiUpdate();
	};

	// just think this looks nice
	interface.append(new UILabel({ id: 'resize', text: '|||' }));
}