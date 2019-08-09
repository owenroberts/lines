function Data(params) {
	const self = this;

	/* from animate/js/files ... combine? */
	this.saveFiledEnabled = false;
	this.saveSettingsOnUnload = params.save || false;
	this.data = {};

	this.load = function(file, json) {
		/* fancy traverse thing or just use default categories ?? */
		console.log(file, json);
	};

	/* one file or multiple files ??? */
	this.save = function() {
		const json = JSON.stringify(self.data);
		const blob = new Blob([json], { type: "application/x-download;charset=utf-8" });
		saveAs(blob, 'data.json');
	};

	if (window.File && window.FileReader && window.FileList && window.Blob) {
		self.saveFilesEnabled = true;
		console.log("%c Save file enabled ", "color:lightgreen;background:black;");
		
		/* canvas */
		// const nav = document.getElementById('nav');
		// nav.addEventListener('dragover', dragOverHandler);
		// nav.addEventListener('drop', dropHandler);
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
				/* use for drag/drop sprites */
				self.fileName = f.name.split('.')[0];
				self.loadJSON(JSON.parse(e.target.result));
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