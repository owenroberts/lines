function setupAnimateInterface(ui) {

	const container = document.getElementById('container');

	ui.toggleTimelineView = function() {
		const timeline = document.getElementById('timeline-panel');
		const play = document.getElementById('play-panel');
		if (this.isOn) {
			container.classList.add('timeline-display');
			container.appendChild(timeline);
			container.appendChild(play);

		} else {
			container.classList.remove('timeline-display');
			const panels = document.getElementById('panels');
			panels.appendChild(timeline);
			panels.appendChild(play);
		}
	};

	ui.toggleRL = function() {
		if (this.isOn) container.classList.add('right');
		else container.classList.remove('right');
	};

	ui.cursorToggle = function() {
		if (lns.canvas.canvas.classList.contains('no-cursor')) 
			lns.canvas.canvas.classList.remove('no-cursor');
		else 
			lns.canvas.canvas.classList.add('no-cursor');
	};

	ui.baseFontSize = 11; 
	ui.updateScale = function(value) {
		if (value) ui.baseFontSize = +value;
		document.body.style.setProperty('--base-font-size', ui.baseFontSize);
	};

	ui.updateFIO = function(data, params) {

		ui.faces.title.value = lns.files.fileName.split('/').pop().replace('.json', '');
		ui.faces.fps.value = data.fps;
		document.title = `${ui.faces.title.value} ~ animate`;

		ui.faces.width.value = data.w;
		ui.faces.height.value = data.h;

		lns.anim.layers.forEach(layer => {
			if (layer) {
				ui.faces.color.addColor(layer.color);
				ui.faces.color.value = layer.color;
			}
		});

		if (data.bg) ui.faces.bgColor.value = data.bg;
		ui.update();
	};

	ui.update = function() {
		ui.timeline.update();
		ui.drawings.update();
		ui.states.update();
	};

	const interfaceSettingsFields = ['timelineView', 'interfaceScale', 'hideCursor', 'rl'];
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
