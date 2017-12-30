function Files_IO() {
	const self = this;

	/* s key */
	this.saveFramesToFile = function(single) {
		Lines.data.saveLines();
		const json = {};
		/* this one second end is kind of specific, maybe to bc?? */
		const end = frames.length * ( 1000 / Number(fps) );
		if (end > 1000) Math.ceil( json.end = end + 1000 );
		else json.end = 1000;
		json.w = Lines.canvas.width;
		json.h = Lines.canvas.height;
		json.fps = Number( Lines.draw.fps );
		json.f = [];
		json.d = [];
		let drawingsIndexes = [];

		/* save current frame */  
		if (single && Lines.data.frames[Lines.draw.currentFrame]) {
			json.f.push( Lines.data.frames[Lines.draw.currentFrame] );
			for (let j = 0; j < Lines.data.frames[Lines.draw.currentFrame].length; j++) {
				if ( drawingsIndexes.indexOf(Lines.data.frames[Lines.draw.currentFrame][j].d) == -1 ) 
					drawingsIndexes.push( Lines.data.frames[Lines.draw.currentFrame][j].d );
			}
		} else {
			/* save fall frames */
			json.f = Lines.data.frames;
			for (let i = 0; i < Lines.data.frames.length; i++) {
				for (let j = 0; j < Lines.data.frames[i].length; j++) {
					if ( drawingsIndexes.indexOf(Lines.data.frames[i][j].d) == -1 ) 
						drawingsIndexes.push( Lines.data.frames[i][j].d );
				}
			}
		}

		for (let i = 0; i < Lines.data.drawings.length; i++) {
			if ( drawingsIndexes.indexOf(i) != -1 ) 
				json.d.push( Lines.data.drawings[i] );
			else json.d.push( 'x' ); // this shouldn't really be necessary if this is written right
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
			$.getJSON(filename + ".json", function(data) {
				Lines.data.frames =  data.f;
				Lines.data.drawings = data.d;
				for (let i = 0; i < Lines.data.drawings.length; i++) {
					if (Lines.data.drawings[i] != 'x') Lines.color.addColorBtn( Lines.data.drawings[i].c );
				}
				Lines.canvas.setWidth(data.w);
				Lines.canvas.setHeight(data.h);
				Lines.draw.setFps(data.fps);
				Lines.draw.reset();
			}).error(function(error) {
				console.error("Loading error:", error.statusText, error);
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

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
	}

	window.addEventListener("beforeunload", function(ev) {
		ev.returnValue = 'Did you save dumbhole?';
	});

}