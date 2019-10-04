function Settings(app, name, appSave, appLoad) {
	const self = this;

	this.name = `settings-${name}`;

	this.save = function() {
		const settings = appSave ? { ...appSave() } : {};
		settings.panels = {};

		for (const p in app.ui.panels) {
			settings.panels[p] = {
				open: app.ui.panels[p].open,
				docked: app.ui.panels[p].isDocked(),
				order: app.ui.panels[p].order
			};
			if (p == 'settings') settings.panels[p].open = false;
		}
		localStorage[self.name] = JSON.stringify(settings);
	};

	this.load = function() {
		if (localStorage[self.name]) {
			const settings = JSON.parse(localStorage[self.name]);
			if (appLoad) appLoad(settings);
			for (const p in settings.panels) {
				if (settings.panels[p].docked) app.ui.panels[p].dock();
				if (!settings.panels[p].open) app.ui.panels[p].toggle();
				app.ui.panels[p].setOrder(settings.panels[p].order);
			}
		}
	};

	this.clear = function() {
		delete localStorage[self.name];
	};

	this.toggleSaveSettings = function() {
		app.files.saveSettingsOnUnload = !app.files.saveSettingsOnUnload;
	};
}