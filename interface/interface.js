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
	this.quickRef = new QuickRef(app);
	this.maxPanels = 100; // limit number of panels open at one time, default 100, basically ignore this -- save for when we have abc layout

	// break between collapsed and uncollapsed panels
	this.panels.append(new UIElement({ id: 'panel-break' }));

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
			ui.handler(ev.target.value, true);
			ui.onPress(true);
		}
	};
	document.addEventListener("keydown", self.keyDown, false);

	window.toolTip = new UILabel({id: 'tool-tip'});
	document.getElementById('interface').appendChild(window.toolTip.el);

	// use module ? 
	this.load = function(file, callback) {
		async function loadInterfaceFiles() {
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
		loadInterfaceFiles();
	};

	this.addSelect = function(panelList) {
		const selector = new UICollection({id: 'selector'});
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
		
		// console.log(data);
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