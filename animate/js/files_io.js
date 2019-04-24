function Files_IO(params) {
	const self = this;

	this.saveFilesEnabled = false;

	/* s key - shift-s for single */
	this.saveFramesToFile = function(title, single, callback) {
		Lines.data.saveLines();

		if (params.fit && confirm("Fit canvas?"))
			Lines.canvas.fitCanvasToDrawing();

		const json = {};
		json.v = "2.2";
		json.w = Math.floor(+Lines.canvas.width);
		json.h = Math.floor(+Lines.canvas.height);
		json.fps = +Lines.draw.fps;
		if (params.bg)
			json.bg = Lines.bgColor.color;
		// what if one color isn't used ?
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

		json.l = []; /* add layers */
		for (let i = 0; i < layerIndexes.length; i++) {
			const index = layerIndexes[i];
			json.l[index] = Lines.layers[index];
		}

		json.d = [];
		for (let i = 0; i < drawingIndexes.length; i++) {
			const index = drawingIndexes[i];
			json.d[index] = Lines.drawings[index];
		}

		const jsonfile = JSON.stringify(json);
		const filename = title || prompt("Name this file:");

		if (filename) {
			const blob = new Blob([jsonfile], {type:"application/x-download;charset=utf-8"});
			saveAs(blob, filename+".json");
		}
		/* to set values ... */
		if (callback) callback(filename);
	};

	/* o key */
	this.loadFramesFromFile = function(callback) {
		const filename = prompt("Open file:");
		if (filename) {
			if (callback) callback(filename);
			fetch(filename + '.json')
				.then(response => { return response.json() })
				.then(data => {
					Lines.frames = data.f;
					Lines.drawings = data.d;
					Lines.layers = data.l;
					for (let i = 0; i < Lines.frames.length; i++) {
						const fr = Lines.frames[i];
						for (let j = 0; j < fr.length; j++) {
							Lines.lineColor.addColorBtn(fr[j].c);
						}
					}
					/* set interface values */
					Lines.canvas.setWidth(data.w);
					Lines.canvas.setHeight(data.h);
					Lines.draw.setFps(data.fps);
					if (data.bg)  // legacy compatible
						Lines.bgColor.setColor(data.bg);
					Lines.draw.reset();
				})
				.catch(error => {
					alert('File not found: ' + error.message);
					console.log(error);
				});
		}
	};
	
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
