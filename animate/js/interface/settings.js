function Settings(panel) {
	const self = this;

	this.saveSettings = function() {
		const settings = {
			canvasColor: lns.canvas.bgColor.color,
			lineWidth: lns.canvas.ctx.lineWidth,
			lineColor: lns.lineColor.color,
			width: lns.canvas.width,
			height: lns.canvas.height,
			fps: lns.render.fps,
			lps: lns.render.lps,
			onionSkinVisible: lns.render.onionSkinVisible,
			onionSkinNum: lns.render.onionSkinNum,
		};
		console.log(settings);
		settings.panels = {};
		for (const p in lns.ui.panels) {
			settings.panels[p] = {
				open: lns.ui.panels[p].open,
				hidden: lns.ui.panels[p].isHidden(),
				order: lns.ui.panels[p].order
			};
			if (p == 'settings') settings.panels[p].open = false;
		}
		settings.palettes = lns.ui.palette.palettes;
		localStorage.settings = JSON.stringify(settings);
	};

	this.loadSettings = function() {
		const settings = JSON.parse(localStorage.settings);
		lns.canvas.bgColor.set(settings.canvasColor);
		lns.canvas.setWidth(settings.width);
		lns.canvas.setHeight(settings.height);
		lns.canvas.setLineWidth(settings.lineWidth);
		lns.render.setFps(settings.fps);
		lns.render.setLps(settings.lps);
		lns.lineColor.set(settings.lineColor);
		lns.render.onionSkinVisible = settings.onionSkinVisible;
		lns.render.onionSkinNum = settings.onionSkinNum;
		for (const p in settings.panels) {
			if (!settings.panels[p].hidden) lns.ui.panels[p].show();
			if (!settings.panels[p].open) lns.ui.panels[p].toggle();
			lns.ui.panels[p].setOrder(settings.panels[p].order);
		}
		lns.ui.palette.palettes = settings.palettes;
		if (lns.ui.palette.current) 
			self.loadPalette(lns.palettes.current);
		for (const key in settings.palettes) {
			if (key != 'current') {
				lns.palettes.panel.add(new UIButton({
					title: key,
					callback: function() {
						self.loadPalette(key);
					}
				}));
			}
		}

		lns.ui.faces.lineColor.setValue(settings.lineColor);
		lns.ui.faces.bgColor.setValue(settings.canvasColor);
		lns.ui.faces.lineWidth.setValue(settings.lineWidth);
	};

	this.canvasLoad = function() {
		if (localStorage.settings) {
			const settings = JSON.parse(localStorage.settings);
			if (settings) lns.canvas.setLineWidth(settings.lineWidth);
		}
	};

	this.clearSettings = function() {
		delete localStorage.settings;
	};

	this.toggleSaveSettings = function() {
		lns.files.saveSettingsOnUnload = !lns.files.saveSettingsOnUnload;
	};
}