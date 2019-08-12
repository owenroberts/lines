function Data(params) {
	const self = this;

	/* from animate/js/files ... combine? */
	this.saveFiledEnabled = false;
	this.saveSettingsOnUnload = params.save || false;

	/* one file or multiple files ??? */
	this.save = function() {
		const sprites = {};
		const ui = {};

		for (const key in Game.sprites) {
			const s = Game.sprites[key];
			sprites[key] = {
				src: `${params.path}sprites/${s.label}.json`,
				x: s.position.x + s.width/2, /* kinda dumb "uncentering" here */
				y: s.position.y + s.height/2,
				states: s.animation.states,
				state: s.animation.state,
				scenes: s.scenes
			};
		}

		for (const key in Game.ui) {
			const s = Game.ui[key];
			ui[key] = {
				src: `${params.path}ui/${s.label}.json`,
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

	this.load = function(callback) {
	
	};

	this.loadSprites = function(file, json) {
		for (const key in json) {
			const params = { label: key, type: file, center: true, ...json[key] }
			Game[file][key] = file == 'ui' ? new GUI(params) : new Item(params);
			for (let i = 0; i < json[key].scenes.length; i++) {
				const scene = json[key].scenes[i];
				if (!Game.scenes.includes(scene)) Game.scenes.push(scene);
			}
		}
	};

	/* drop ui ? */
	this.dropSprite = function(fileName, json, x, y) {
		Game.sprites[fileName] = new Item({ label: fileName, center: true, ...edi.zoom.translate(x, y) });
		Game.sprites[fileName].scenes = [Game.scene];
		Game.sprites[fileName].addJSON(json, function() {
			Game.sprites[fileName].center();
		});
	};

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		
		const nav = document.getElementById('map');
		nav.addEventListener('dragover', dragOverHandler);
		nav.addEventListener('drop', dropHandler);
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

					self.dropSprite(f.name.split('.')[0], JSON.parse(e.target.result), ev.offsetX, ev.offsetY);
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