function Data(app, params) {
	const self = this;

	/* from animate/js/files ... combine? */
	this.saveFiledEnabled = false;
	this.saveSettingsOnUnload = params.save || false;

	/* one file or multiple files ??? */
	this.save = function() {
		saveFile(0, {});
	};

	function saveFile(count, settings) {
		const file = params.files[count];
		const data = {};
		settings[file] = {};
		for (const key in app.sprites[file]) {
			const s = app.sprites[file][key];
			if (!s.isRemoved) {
				data[key] = s.data;
				settings[file][key] = s.settings;
			}
		}
		const f = download(data, `${file}.json`);
		f.onwriteend = () => {
			if (count < params.files.length - 1) {
				count++;
				saveFile(count, settings);
			} else {
				download(settings, 'settings.json');
			}
		};
	}

	function download(data, fileName) {
		const json = JSON.stringify(data);
		const blob = new Blob([json], { type: "application/x-download;charset=utf-8" });
		return saveAs(blob, fileName);
	};

	this.dropSprite = function(fileName, json, x, y) {
		/* prompts for now, use modal or something ... */

		let mod = 'sprites', type = 'scenery';
		let location; 
		const modal = new UIModal("Add Sprite", edi, { x: x, y: y }, function() {
			if (mod == 'ui') location = app[mod];
			else location = app[mod][type];
		
			let C = ItemEdit;
			if (type == 'textures') C = TextureEdit;
			if (type == 'ui') C = UIEdit;

			// replace with edi.loadAnimation??

			// prob way to extend Game.js to do this
			let animation = new GameAnim();
			animation.load(`${params.path}/sprites/${fileName}.json`, function() {
				const s = new C({
					animation: animation,
					label: fileName,
					src: `${params.path}/sprites/${fileName}.json`,
					scenes: [app.scene],
					locations: [edi.zoom.translate(x, y)],
					...edi.zoom.translate(x, y)
				});
				location[fileName] = s;
				gme.scenes.add(s, app.scene);
				s.isLoaded = true;
			});
		});

		modal.add(new UISelect({
			options: ['ui', 'sprites'],
			selected: mod,
			callback: function(value) {
				mod = value;
			}
		}));

		modal.add(new UISelect({
			options: Object.keys(gme.sprites),
			selected: type,
			callback: function(value) {
				type = value;
			}
		}));
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