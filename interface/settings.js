function Settings(app, name, appSave) {
	const self = this;

	const appName = `settings-${name}`;
	const workspaceFields = [
		'timelineView', 
		'interfaceScale', 
		// 'hideCursor', 
		'rl'
	];

	function loadPanels(panels) {
		for (const p in panels) {
			if (p === 'el') continue;
			
			if (panels[p].docked) app.ui.panels[p].dock();
			else app.ui.panels[p].undock();
			
			// ui.panels[p].open.update(panels[p].open);
			if (!panels[p].open) app.ui.panels[p].close();
			
			if (panels[p].block) app.ui.panels[p].block();
			if (panels[p].headless) app.ui.panels[p].headless();
			
			app.ui.panels[p].order = panels[p].order;
		}
	}

	function loadInterface(interface) {
		for (const f in interface) {
			lns.ui.faces[f] = interface[f];
		}
	}

	this.save = function() {
		const settings = appSave ? { ...appSave() } : {};
		settings.panels = {};

		for (const p in app.ui.panels) {
			if (p !== 'el') {
				settings.panels[p] = {
					open: app.ui.panels[p].isOpen,
					docked: app.ui.panels[p].isDocked,
					order: app.ui.panels[p].order,
					block: app.ui.panels[p].isBlock,
					headless: app.ui.panels[p].isHeadless
				};
			}
		}
		console.log(settings.panels);
		localStorage[appName] = JSON.stringify(settings);
	};

	this.load = function(appLoad) {
		if (localStorage[appName]) {
			const settings = JSON.parse(localStorage[appName]);
			if (appLoad) appLoad(settings);
			loadPanels(settings.panels)
		}
	};

	this.clear = function() {
		delete localStorage[appName];
	};

	// better way to set this up??
	this.toggleSaveSettings = function() {
		app.files.saveSettingsOnUnload = !app.files.saveSettingsOnUnload;
	};

	this.saveLayout = function() {
		self.save();
		const interfaceSettings = {};
		workspaceFields.forEach(f => {
			interfaceSettings[f] = lns.ui.faces[f].value;
		});
		const panelSettings = JSON.parse(localStorage.getItem(appName)).panels;
		const jsonFile = JSON.stringify({ panels: panelSettings, interface: interfaceSettings });
		const fileName = prompt('Layout Name:', 'New Layout');
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, `${fileName}.json`);
	};

	this.loadLayoutFile = function(url) {
		// load default file
		if (url) {
			fetch(url)
				.then(response => { return response.json() })
				.then(data => { loadInterface(data); })
				.catch(error => { console.error(error); });
		} else {
			// choose file to load
			const openFile = document.createElement('input');
			openFile.type = "file";
			openFile.click();
			openFile.onchange = function() {
				for (let i = 0, f; f = openFile.files[i]; i++) {
					if (!f.type.match('application/json')) continue;
					const reader = new FileReader();
					reader.onload = (function(theFile) {
						return function(e) {
							const settings = JSON.parse(e.target.result);
							loadPanels(settings.panels);
							loadInterface(settings.interface);
						}
					})(f);
					reader.readAsText(f);
				}
			};
		}
	};

}