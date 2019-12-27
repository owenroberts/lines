function Settings(app, name, appSave, appLoad) {
	const self = this;

	this.name = `settings-${name}`;

	this.save = function() {
		const settings = appSave ? { ...appSave() } : {};
		settings.panels = {};

		for (const p in app.ui.panels) {
			settings.panels[p] = {
				open: app.ui.panels[p].open,
				docked: app.ui.panels[p].isDocked,
				order: app.ui.panels[p].order,
				block: app.ui.panels[p].isBlock,
				headless: app.ui.panels[p].isHeadless
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
				if (p != 'el') { /* fix later */
					if (settings.panels[p].docked) app.ui.panels[p].dock();
					if (!settings.panels[p].open) app.ui.panels[p].toggle();
					if (settings.panels[p].block) app.ui.panels[p].block();
					if (settings.panels[p].headless) app.ui.panels[p].headless();
					app.ui.panels[p].order = settings.panels[p].order;
				}
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