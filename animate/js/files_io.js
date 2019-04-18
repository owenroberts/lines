function Files_IO(params) {
	const self = this;

	this.saveFilesEnabled = false;

	/* s key - shift-s for single */
	this.saveFramesToFile = function(single) {
		Lines.data.saveLines();

		if (params.fit && confirm("Fit canvas?"))
			Lines.canvas.fitCanvasToDrawing();

		const json = {};
		json.v = "2.2";
		json.w = Math.floor(+Lines.canvas.width);
		json.h = Math.floor(+Lines.canvas.height);
		json.fps = +Lines.draw.fps;
		if (params.bg)
			json.bg = Cool.rgb2hex(Lines.canvas.canvas.style.backgroundColor).split('#')[1];
		json.mc = Lines.lineColor.colors.length > 1 ? true : false;
		
		/* save current frame */
		let frames;
		if (single && Lines.frames[Lines.currentFrame])
			frames = [Lines.frames[Lines.currentFrame]];
		else
			frames = Lines.frames;
		json.f = frames;

		/* search frames for layers and drawings used */
		const drawingIndexes = [], layerIndexes = [];
		for (let i = 0; i < frames.length; i++) {
			const frame = frames[i];
			for (let j = 0; j < frame.length; j++) {
				const layerIndex = frame[j].l;
				const drawingIndex =  Lines.layers[layerIndex].d;
				if (!layerIndexes.includes(layerIndex))
					layerIndexes.push(layerIndex);
				if (!drawingIndexes.includes(drawingIndex))
					drawingIndexes.push(drawingIndex);
			}
		}

		/* add layers */
		json.l = [];
		for (let i = 0; i < layerIndexes.length; i++) {
			const index = layerIndexes[i];
			json.l[index] = Lines.layers[index];
		}

		json.d = [];
		for (let i = 0; i < Lines.drawings.length; i++) {
			if (drawingIndexes.includes(i))
				json.d[i] = Lines.drawings[i]; // preserve index
		}

		const jsonfile = JSON.stringify(json);
		let filename = self.title.getValue();

		if (!filename) {
			filename = prompt("Name this file:");
			self.title.setValue(filename);
		}
		if (filename) {
			const blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
	};

	/* o key */
	this.loadFramesFromFile = function() {
		const filename = prompt("Open file:");
		if (filename) {
			self.title.setValue(filename.split("/").pop());
			fetch(filename + '.json')
				.then(response => { return response.json() })
				.then(data => {
					Lines.frames =  data.f;
					Lines.drawings = data.d;
					Lines.layers = data.l;
					for (let i = 0; i < Lines.frames.length; i++) {
						const fr = Lines.frames[i];
						for (let j = 0; j < fr.length; j++) {
							Lines.lineColor.addColorBtn(fr[j].c);
						}
					}
					Lines.canvas.setWidth(data.w);
					Lines.canvas.setHeight(data.h);
					Lines.draw.setFps(data.fps);
					Lines.drawingInterface.fpsSelect.setValue(data.fps);
					if (data.bg)  // legacy compatible
						Lines.canvas.bgColor.setColor(data.bg);
					Lines.draw.reset();

					/* add wiggle params to old files */
					for (let i = 0; i < Lines.layers.length; i++) {
						const layer = Lines.layers[i];
						if (!layer.w) layer.w = 0;
						if (!layer.v) layer.v = 0;
					}
				})
				.catch(error => {
					alert('File not found: ' + error.message);
					console.log(error);
				});
		}
	};

	/* interfaces */
	const save = new UIButton({
		id:"save",
		title: "Save",
		callback: function() {
			self.saveFramesToFile(false);
		},
		key: "s"
	});

	const saveFrame = new UIButton({
		id:"save-frame",
		title: "Save Frame",
		callback: function() {
			self.saveFramesToFile(true);
		},
		key: "shift-s"
	});

	const open = new UIButton({
		id: "open",
		title: "Open",
		callback: self.loadFramesFromFile,
		key: "o"
	});

	this.title = new UI({id:"title"});
	/* save with enter? */

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
	}

	window.addEventListener("beforeunload", function(ev) {
		if (params.save) Lines.interface.saveSettings();
		ev.returnValue = 'Did you save dumbhole?';
	});

}
