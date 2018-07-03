function Files_IO() {
	const self = this;

	this.saveFilesEnabled = false;

	/* s key - shif-s for single */
	this.saveFramesToFile = function(single) {
		Lines.data.saveLines();

		const json = {};
		json.v = "2.0";
		json.w = Number( Lines.canvas.width );
		json.h = Number( Lines.canvas.height );
		json.fps = Number( Lines.draw.fps );
		json.bg = Lines.canvas.bgColor.color;
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
			/* save fall frames */
			json.f = Lines.frames;
			for (let i = 0; i < Lines.frames.length; i++) {
				for (let j = 0; j < Lines.frames[i].length; j++) {
					if ( drawingsIndexes.indexOf(Lines.frames[i][j].d) == -1 ) 
						drawingsIndexes.push( Lines.frames[i][j].d );
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
					for (let i = 0; i < Lines.drawings.length; i++) {
						/* unused drawings are null, this is okay, not looped
						 	x for legacy compatibility */
						if (Lines.drawings[i] && Lines.drawings[i] != 'x')
							Lines.lineColor.addColorBtn( Lines.drawings[i].c );
					}
					Lines.canvas.setWidth(data.w);
					Lines.canvas.setHeight(data.h);
					Lines.draw.setFps(data.fps);
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

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
	}

	window.addEventListener("beforeunload", function(ev) {
		ev.returnValue = 'Did you save dumbhole?';
	});

}