function Data(app, params) {
	const self = this;

	/* from animate/js/files ... combine? */
	this.saveFiledEnabled = false;
	this.saveSettingsOnUnload = params.save || false;

	/* one file or multiple files ??? */
	this.save = function() {
		const sprites = {};
		const ui = {};

		for (const type in app.sprites) {
			if (!sprites[type]) sprites[type] = {};
			for (const key in app.sprites[type]) {
				sprites[type][key] = app.sprites[type][key].data;
			}
		}

		for (const key in app.ui) {
			const s = app.ui[key];
			ui[key] = {
				src: `${params.path}/ui/${s.label}.json`,
				x: s.x,
				y: s.y,
				states: s.animation.states,
				state: s.animation.state,
				scenes: s.scenes
			};
		}

		const f = self.download(sprites, 'sprites.json');
		f.onwriteend = function() { 
			self.download(ui, 'ui.json');
		};
	};

	this.download = function(data, fileName) {
		const json = JSON.stringify(data);
		const blob = new Blob([json], { type: "application/x-download;charset=utf-8" });
		return saveAs(blob, fileName);
	};

	this.dropSprite = function(fileName, json, x, y) {
		/* prompts for now, use modal or something ... */
		const mod = prompt("ui or sprites?");
		let location, type;
		if (mod == 'sprites') {
			type = prompt('type? (scenery, textures)');
			location = app[mod][type];
		} else {
			type = 'ui';
		}
		location[fileName] = new classes[type]({ 
			label: fileName,
			src: `${params.path}/sprites/${fileName}.json`,
			scenes: [app.scene],
			...edi.zoom.translate(x, y) 
		});
	};

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		
		const nav = document.getElementById('map');
		if (nav) {
			nav.addEventListener('dragover', dragOverHandler);
			nav.addEventListener('drop', dropHandler);
		}
	
		// https://gist.github.com/andjosh/7867934
	}

	function dropHandler(ev) {
 		ev.preventDefault();
 		ev.stopPropagation();

 		const files = ev.dataTransfer.files;
     	for (let i = 0, f; f = files[i]; i++) {
			if (!f.type.match('application/json')) {
          		continue;
        	}
        	const reader = new FileReader();
			reader.onload = (function(theFile) {
				return function(e) {
					self.dropSprite(
						f.name.split('.')[0], 
						JSON.parse(e.target.result), 
						ev.offsetX, ev.offsetY
					);
          		};
        	})(f);
        	reader.readAsText(f);
        }
	}

	function dragOverHandler(ev) {
		ev.preventDefault();
	}
	
	window.addEventListener("beforeunload", function(ev) {
		if (self.saveSettingsOnUnload) lns.ui.settings.saveSettings();
		if (params.reload) ev.returnValue = 'Did you save dumbhole?';
	});
}