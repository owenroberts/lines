function setupAnimateInterface(ui) {


	const interfaceSettingsFields = [
		'timelineView', 
		'interfaceScale', 
		'hideCursor', 
		'rl'
	];
	// interface scale is baseFontSize

	ui.saveInterfaceLayout = function() {
		lns.ui.settings.save();
		const interfaceSettings = {};
		interfaceSettingsFields.forEach(f => {
			interfaceSettings[f] = lns.ui.faces[f];
		});
		const panelSettings = JSON.parse(localStorage.getItem('settings-lns')).panels;
		const jsonFile = JSON.stringify({ panels: panelSettings, interface: interfaceSettings });
		const fileName = prompt('Layout Name:', 'New Layout');
		const blob = new Blob([jsonFile], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, `${fileName}.json`);
	};

	function loadInterface(json) {
		const { panels, interface } = json;
		for (const p in panels) {
			
			if (panels[p].docked) ui.panels[p].dock();
			else ui.panels[p].undock();
			
			ui.panels[p].open.update(panels[p].open);
			
			if (panels[p].block) ui.panels[p].block();
			if (panels[p].headless) ui.panels[p].headless();
			
			ui.panels[p].order = panels[p].order;
		}

		for (const f in interface) {
			lns.ui.faces[f] = interface[f];
		}
	}

	ui.loadInterfaceFile = function(url) {

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
							loadInterface(JSON.parse(e.target.result))
						}
					})(f);
					reader.readAsText(f);
				}
			};
		}
	};

}
