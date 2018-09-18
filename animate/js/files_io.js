function Files_IO(params) {
	const self = this;

	this.saveFilesEnabled = false;

	/* s key - shift-s for single */
	this.saveFramesToFile = function(single) {
		Lines.data.saveLines();

		if (params.fit) {
			const fit = confirm("Fit canvas?");
			if (fit)
				Lines.canvas.fitCanvasToDrawing();
		}

		const json = {};
		json.v = "2.1";
		json.w = Math.floor(+Lines.canvas.width);
		json.h = Math.floor(+Lines.canvas.height);
		json.fps = +Lines.draw.fps;
		json.bg = Cool.rgb2hex(Lines.canvas.canvas.style.backgroundColor).split('#')[1];
		json.mc = Lines.lineColor.colors.length > 1 ? true : false;
		json.f = [];
		json.d = [];

		let drawingsIndexes = [];

		/* save current frame */  
		if (single && Lines.frames[Lines.currentFrame]) {
			json.f.push( Lines.frames[Lines.currentFrame] );
			for (let j = 0; j < Lines.frames[Lines.currentFrame].length; j++) {
				if ( drawingsIndexes.indexOf(Lines.frames[Lines.currentFrame][j].d) == -1 ) 
					drawingsIndexes.push( Lines.frames[Lines.currentFrame][j].d );
			}
		} else {
			/* save all frames */
			json.f = Lines.frames;
			for (let i = 0; i < Lines.frames.length; i++) {
				for (let j = 0; j < Lines.frames[i].length; j++) {
					if ( drawingsIndexes.indexOf(Lines.frames[i][j].d) == -1 ) 
						drawingsIndexes.push( Lines.frames[i][j].d );
				}

				/* get rid of layer info */
				for (let j = 0; j < Lines.frames[i].length; j++) {
					const layer = Lines.frames[i][j];
					if (layer.prevColor) {
						if (layer.c != layer.prevColor) {
							layer.c = layer.prevColor
						}
						delete layer.prevColor;
					}
					delete layer.toggled;
				}
			}
		}

		for (let i = 0; i < Lines.drawings.length; i++) {
			if ( drawingsIndexes.indexOf(i) != -1 ) 
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
					for (let i = 0; i < Lines.frames.length; i++) {
						const frame = Lines.frames[i];
						for (let j = 0; j < frame.length; j++) {
							const layer = frame[j];
							if (!layer.w)
								layer.w = 0;
							if (!layer.v)
								layer.v = 0;
						}
					}
				})
				.catch(error => { console.log(error.message) });
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
		ev.returnValue = 'Did you save dumbhole?';
	});

}