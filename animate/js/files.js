function Files(params) {
	const self = this;

	this.saveFilesEnabled = false;
	this.saveOnUnload = params.save || false;
	this.fileName = undefined;

	this.toggleSaveSettings = function() {
		self.saveOnUnload = !self.saveOnUnload;
	};

	/* s key - shift-s for single */
	this.saveFramesToFile = function(title, single, callback) {
		lns.data.saveLines();

		if (params.fit && confirm("Fit canvas?"))
			lns.canvas.fitCanvasToDrawing();

		const json = {};
		json.v = "2.3";
		json.w = Math.floor(+lns.canvas.width);
		json.h = Math.floor(+lns.canvas.height);
		json.fps = +lns.render.fps;
		if (params.bg) json.bg = lns.bgColor.color;
		// what if one color isn't used ?
		json.mc = lns.lineColor.colors.length > 1 ? true : false;

		/* save current frame */
		let layers = [];
		if (single && lns.getLayers()) {
			layers = lns.getLayers();
		} else {
			for (let i = 0; i < lns.layers.length; i++) {
				if (lns.layers[i].f.length > 0)
					layers.push(lns.layers[i]);
			}
		}
		
		for (let i = 0; i < layers.length; i++) {
			layers[i].clean();
		}
		json.l = layers;

		/* search frames for layers and drawings used */
		const drawingIndexes = [];
		for (let i = 0; i < layers.length; i++) {
			const drawingIndex = layers[i].d;
			if (!drawingIndexes.includes(drawingIndex))
				drawingIndexes.push(drawingIndex);
		}

		json.d = [];
		for (let i = 0; i < drawingIndexes.length; i++) {
			const index = drawingIndexes[i];
			json.d[index] = lns.drawings[index];
		}

		const jsonfile = JSON.stringify(json);
		const filename = title || prompt("Name this file:");

		if (filename) {
			const blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, `${filename}.json`);
		}

		/* to set values ... */
		if (callback) callback(filename);
	};

	/* o key */
	this.loadFramesFromFile = function(filename, callback) {
		self.fileName = filename || prompt("Open file:");
		if (self.fileName) {
			if (callback) callback(self.fileName);
			fetch(self.fileName + '.json')
				.then(response => { return response.json() })
				.then(data => {
					lns.drawings = data.d;
					lns.layers = data.l;
					for (let i = 0; i < lns.layers.length; i++) {
						lns.lineColor.addColorBtn(lns.layers[i].c);
					}
					/* set interface values */
					lns.canvas.setWidth(data.w);
					lns.canvas.setHeight(data.h);
					lns.render.setFps(data.fps);
					if (data.bg) lns.bgColor.set(data.bg);
					lns.render.reset();

					if (lns.interface) {
						lns.interface.title.setValue(self.fileName.split('/').pop());
						lns.interface.faces.width.set(data.w);
						lns.interface.faces.height.set(data.h);
						let color;
						lns.layers.some(layer => {
							if (layer) {
								color = layer.c;
								return true;
							}
						});
						lns.layers.forEach(layer => {
							if (layer)
								lns.interface.faces.lineColor.setValue(layer.c);
						});

						if (data.bg) lns.interface.faces.bgColor.setValue(data.bg);
						lns.interface.faces.fps.setValue(data.fps);
					}
				})
				.catch(error => {
					alert('File not found: ' + error.message);
					console.log(error);
				});
		}
	};

	this.reOpenFile = function() {
		if (self.fileName) localStorage.setItem('re-open', self.fileName);
		location.reload();
	};

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
	}

	window.addEventListener("beforeunload", function(ev) {
		if (self.saveOnUnload) lns.interface.saveSettings();
		if (params.reload) ev.returnValue = 'Did you save dumbhole?';
	});
}
